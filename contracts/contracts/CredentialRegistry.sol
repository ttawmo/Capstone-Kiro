// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialRegistry
 * @notice Proof-of-concept shared credential layer for high-risk construction
 *         (crane lifting). Trusted issuers record portable worker/equipment
 *         credentials on-chain; contractors create lifting activities and the
 *         contract checks eligibility before a lift may proceed.
 *
 * Scope rules (see .kiro/steering/tech.md):
 *  - On-chain stores ONLY: credential ref, type, issuer, holder/asset id,
 *    issue date, expiry, status, and the SHA-256 hash of the backing document.
 *  - PDFs, personal data, and application data live OFF-chain (Supabase).
 *  - Keep the surface small (~6 functions). Do not add functions beyond scope.
 */
contract CredentialRegistry is AccessControl {
    // ----- Roles -----
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");
    bytes32 public constant PROJECT_OWNER_ROLE = keccak256("PROJECT_OWNER_ROLE");

    // ----- Types -----
    enum Status {
        None, // 0 - never issued
        Valid, // 1
        Revoked // 2
    }

    struct Credential {
        string credentialType; // e.g. "crane-inspection", "operator-licence"
        bytes32 holderRef; // hash/ref of worker or machine id (not personal data)
        address issuer; // who issued it
        uint64 issuedAt; // unix seconds
        uint64 expiry; // unix seconds; 0 means no expiry
        Status status; // Valid / Revoked
        bytes32 docHash; // SHA-256 of the backing certificate (off-chain file)
    }

    struct Activity {
        address contractor; // who created it
        bytes32[] requiredCredentials; // credential ids that must all be valid
        bool approved; // project-owner clearance recorded
        bool exists;
    }

    // ----- Storage -----
    // credentialId => Credential
    mapping(bytes32 => Credential) private _credentials;
    // activityId => Activity
    mapping(bytes32 => Activity) private _activities;

    // ----- Events -----
    event CredentialIssued(
        bytes32 indexed credentialId,
        string credentialType,
        address indexed issuer,
        uint64 expiry,
        bytes32 docHash
    );
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);
    event ActivityCreated(bytes32 indexed activityId, address indexed contractor);
    event ClearanceApproved(bytes32 indexed activityId, address indexed owner);

    constructor() {
        // Deployer administers roles and can grant issuer/contractor/owner roles.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ---------------------------------------------------------------------
    // 1. issueCredential — only an authorised issuer
    // ---------------------------------------------------------------------
    function issueCredential(
        bytes32 credentialId,
        string calldata credentialType,
        bytes32 holderRef,
        uint64 expiry,
        bytes32 docHash
    ) external onlyRole(ISSUER_ROLE) {
        require(credentialId != bytes32(0), "credentialId required");
        require(_credentials[credentialId].status == Status.None, "already issued");

        _credentials[credentialId] = Credential({
            credentialType: credentialType,
            holderRef: holderRef,
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            expiry: expiry,
            status: Status.Valid,
            docHash: docHash
        });

        emit CredentialIssued(credentialId, credentialType, msg.sender, expiry, docHash);
    }

    // ---------------------------------------------------------------------
    // 2. revokeCredential — only the issuer who issued it
    // ---------------------------------------------------------------------
    function revokeCredential(bytes32 credentialId) external onlyRole(ISSUER_ROLE) {
        Credential storage c = _credentials[credentialId];
        require(c.status == Status.Valid, "not a valid credential");
        require(c.issuer == msg.sender, "only issuing issuer may revoke");

        c.status = Status.Revoked;
        emit CredentialRevoked(credentialId, msg.sender);
    }

    // ---------------------------------------------------------------------
    // 3. isCredentialValid — view: valid = issued, not revoked, not expired
    // ---------------------------------------------------------------------
    function isCredentialValid(bytes32 credentialId) public view returns (bool) {
        Credential storage c = _credentials[credentialId];
        if (c.status != Status.Valid) {
            return false;
        }
        if (c.expiry != 0 && c.expiry <= block.timestamp) {
            return false;
        }
        return true;
    }

    // ---------------------------------------------------------------------
    // 4. createActivity — only a contractor
    // ---------------------------------------------------------------------
    function createActivity(
        bytes32 activityId,
        bytes32[] calldata requiredCredentials
    ) external onlyRole(CONTRACTOR_ROLE) {
        require(activityId != bytes32(0), "activityId required");
        require(!_activities[activityId].exists, "activity exists");

        _activities[activityId] = Activity({
            contractor: msg.sender,
            requiredCredentials: requiredCredentials,
            approved: false,
            exists: true
        });

        emit ActivityCreated(activityId, msg.sender);
    }

    // ---------------------------------------------------------------------
    // 5. checkEligibility — view: ELIGIBLE only if every required credential
    //    is currently valid. Returns the first failing credential id (or 0).
    // ---------------------------------------------------------------------
    function checkEligibility(
        bytes32 activityId
    ) public view returns (bool eligible, bytes32 firstInvalid) {
        Activity storage a = _activities[activityId];
        require(a.exists, "no such activity");

        bytes32[] storage reqs = a.requiredCredentials;
        for (uint256 i = 0; i < reqs.length; i++) {
            if (!isCredentialValid(reqs[i])) {
                return (false, reqs[i]);
            }
        }
        return (true, bytes32(0));
    }

    // ---------------------------------------------------------------------
    // 6. approveClearance — only a project owner, and only if eligible
    // ---------------------------------------------------------------------
    function approveClearance(bytes32 activityId) external onlyRole(PROJECT_OWNER_ROLE) {
        Activity storage a = _activities[activityId];
        require(a.exists, "no such activity");

        (bool eligible, ) = checkEligibility(activityId);
        require(eligible, "activity not eligible");

        a.approved = true;
        emit ClearanceApproved(activityId, msg.sender);
    }

    // ----- Read helpers (views for the frontend) -----
    function getCredential(
        bytes32 credentialId
    )
        external
        view
        returns (
            string memory credentialType,
            bytes32 holderRef,
            address issuer,
            uint64 issuedAt,
            uint64 expiry,
            Status status,
            bytes32 docHash
        )
    {
        Credential storage c = _credentials[credentialId];
        return (c.credentialType, c.holderRef, c.issuer, c.issuedAt, c.expiry, c.status, c.docHash);
    }

    function getActivity(
        bytes32 activityId
    ) external view returns (address contractor, bytes32[] memory requiredCredentials, bool approved) {
        Activity storage a = _activities[activityId];
        require(a.exists, "no such activity");
        return (a.contractor, a.requiredCredentials, a.approved);
    }

    /**
     * @notice Verify a document against the stored hash (tamper detection).
     * @dev The caller computes SHA-256 of the file off-chain and passes it here.
     */
    function verifyDocument(bytes32 credentialId, bytes32 candidateHash) external view returns (bool) {
        return _credentials[credentialId].docHash == candidateHash;
    }
}
