// contracts/RetroFit.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RetroFit {
    struct Project {
        uint256 id;
        address owner;
        string name;
        string description;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 expectedReturn; // in basis points (850 = 8.5%)
        uint256 duration; // in days
        Status status;
        uint256 investorCount;
    }

    struct Milestone {
        uint256 projectId;
        uint256 milestoneId;
        string name;
        string description;
        uint256 amount;
        bool completed;
        string proofHash;
    }

    struct Investment {
        address investor;
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
    }

    enum Status { Funding, InProgress, Completed, Cancelled }

    uint256 public projectCounter;
    address public owner;
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public projectMilestones;
    mapping(uint256 => Investment[]) public projectInvestments;
    mapping(uint256 => mapping(address => uint256)) public investments;
    mapping(uint256 => address[]) public projectInvestors;

    event ProjectCreated(uint256 indexed projectId, address indexed owner, string name);
    event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 amount);
    event MilestoneCompleted(uint256 indexed projectId, uint256 indexed milestoneId, string proofHash);

    constructor() {
        owner = msg.sender;
        projectCounter = 0;
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _expectedReturn,
        uint256 _duration
    ) external returns (uint256) {
        projectCounter++;
        
        projects[projectCounter] = Project({
            id: projectCounter,
            owner: msg.sender,
            name: _name,
            description: _description,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            expectedReturn: _expectedReturn,
            duration: _duration,
            status: Status.Funding,
            investorCount: 0
        });

        emit ProjectCreated(projectCounter, msg.sender, _name);
        return projectCounter;
    }

    function addMilestone(
        uint256 _projectId,
        string memory _name,
        string memory _description,
        uint256 _amount
    ) external {
        require(projects[_projectId].owner == msg.sender, "Only project owner can add milestones");
        require(projects[_projectId].status == Status.Funding, "Project must be in funding stage");

        projectMilestones[_projectId].push(Milestone({
            projectId: _projectId,
            milestoneId: projectMilestones[_projectId].length,
            name: _name,
            description: _description,
            amount: _amount,
            completed: false,
            proofHash: ""
        }));
    }

    function invest(uint256 _projectId) external payable {
        Project storage project = projects[_projectId];
        require(project.status == Status.Funding, "Project not in funding stage");
        require(msg.value > 0, "Investment must be greater than 0");

        project.raisedAmount += msg.value;

        Investment memory newInvestment = Investment({
            investor: msg.sender,
            projectId: _projectId,
            amount: msg.value,
            timestamp: block.timestamp
        });

        projectInvestments[_projectId].push(newInvestment);
        investments[_projectId][msg.sender] += msg.value;

        if (investments[_projectId][msg.sender] == msg.value) {
            projectInvestors[_projectId].push(msg.sender);
            project.investorCount++;
        }

        emit InvestmentMade(_projectId, msg.sender, msg.value);
    }

    function completeMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        string memory _proofHash
    ) external {
        require(projects[_projectId].owner == msg.sender, "Only project owner can complete milestones");
        require(_milestoneId < projectMilestones[_projectId].length, "Invalid milestone");
        
        Milestone storage milestone = projectMilestones[_projectId][_milestoneId];
        require(!milestone.completed, "Milestone already completed");

        milestone.completed = true;
        milestone.proofHash = _proofHash;

        emit MilestoneCompleted(_projectId, _milestoneId, _proofHash);
    }

    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    function getMilestones(uint256 _projectId) external view returns (Milestone[] memory) {
        return projectMilestones[_projectId];
    }

    function getInvestments(uint256 _projectId) external view returns (Investment[] memory) {
        return projectInvestments[_projectId];
    }
}