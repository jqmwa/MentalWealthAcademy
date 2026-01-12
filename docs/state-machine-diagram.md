# Mental Wealth Academy - Component State Machine Diagram

This document describes the state machines for the major components and user flows in the application.

## Table of Contents
1. [Application-Level State Machine](#application-level-state-machine)
2. [Authentication Flow](#authentication-flow)
3. [Onboarding Flow](#onboarding-flow)
4. [Proposal/Voting System](#proposalvoting-system)
5. [Quest System](#quest-system)
6. [Ideas/Learning Flow](#ideaslearning-flow)

---

## Application-Level State Machine


```mermaid
stateDiagram-v2
    [*] --> Landing

    state "Unauthenticated" as unauth {
        Landing --> SignIn: Email/Password
        Landing --> WalletConnect: Connect Ethereum
        SignIn --> Landing: Failed
        WalletConnect --> Landing: Cancelled
    }

    state "Authentication" as auth {
        SignIn --> CheckProfile: Success
        WalletConnect --> WalletSignup: Connected
        WalletSignup --> CheckProfile: Account Created
    }

    state "Onboarding" as onboard {
        CheckProfile --> OnboardingModal: Profile Incomplete
        OnboardingModal --> AvatarSelection: Profile Saved
        AvatarSelection --> Home: Avatar Selected
        CheckProfile --> AvatarSelection: No Avatar
        CheckProfile --> Home: Profile Complete
    }

    state "Authenticated App" as app {
        Home --> Quests
        Home --> Ideas
        Home --> Voting
        Home --> Library
        Home --> Forum
        Quests --> Home
        Ideas --> Home
        Voting --> Home
        Library --> Home
        Forum --> Home
    }

    state "Session Management" as session {
        app --> Landing: Sign Out
        app --> Landing: Session Expired
    }
```

---

## Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> LandingPage

    state "Landing Page" as LandingPage {
        [*] --> TabSelection
        
        state "Tab Selection" as TabSelection {
            [*] --> SignInTab: User Selects Sign In
            [*] --> SignUpTab: User Selects Sign Up
        }
        
        state "Sign In Flow" as SignInTab {
            [*] --> InputCredentials
            InputCredentials --> Submitting: Submit Form
            Submitting --> Success: Login Success
            Submitting --> ShowError: Login Failed
            ShowError --> InputCredentials: Retry
        }
        
        state "Sign Up Flow" as SignUpTab {
            [*] --> InputCredentials
            InputCredentials --> Submitting: Submit Form
            Submitting --> Success: Signup Success
            Submitting --> ShowError: Signup Failed
            ShowError --> InputCredentials: Retry
        }
    }

    state "Wallet Auth" as WalletAuth {
        [*] --> WalletPrompt
        WalletPrompt --> WalletConnecting: User Clicks Connect
        WalletConnecting --> WalletConnected: Success
        WalletConnecting --> WalletError: Failed
        WalletConnected --> CreateWalletAccount: No Account
        WalletConnected --> ExistingAccount: Has Account
        CreateWalletAccount --> ShowOnboarding
        ExistingAccount --> RedirectHome
        WalletError --> WalletPrompt: Retry
    }

    SignInTab --> RedirectHome: Success
    SignUpTab --> ShowOnboarding: Success
    ShowOnboarding --> OnboardingFlow
    OnboardingFlow --> RedirectHome: Complete
    
    RedirectHome --> [*]
```

---

## Onboarding Flow

```mermaid
stateDiagram-v2
    [*] --> AccountStep
    
    state "Account Step" as AccountStep {
        [*] --> ShowForm
        ShowForm --> ValidatingEmail: Email Input (non-wallet)
        ShowForm --> ValidatingUsername: Username Input
        ShowForm --> ValidatingBirthday: Birthday Input
        ShowForm --> ValidatingPassword: Password Input (non-wallet)
        
        ValidatingEmail --> EmailValid: Valid Format
        ValidatingEmail --> EmailInvalid: Invalid
        EmailInvalid --> ShowForm: Fix
        
        ValidatingUsername --> CheckingAvailability: 5+ chars
        CheckingAvailability --> UsernameAvailable: Available
        CheckingAvailability --> UsernameTaken: Taken
        UsernameTaken --> ShowForm: Choose Different
        
        ValidatingBirthday --> AgeValid: 18+ years
        ValidatingBirthday --> AgeInvalid: Under 18
        AgeInvalid --> ShowForm: Error Shown
        
        ValidatingPassword --> PasswordValid: 8+ chars
        ValidatingPassword --> PasswordInvalid: Too Short
        PasswordInvalid --> ShowForm: Fix
    }
    
    state "Form Ready" as FormReady {
        EmailValid --> FormReady
        UsernameAvailable --> FormReady
        AgeValid --> FormReady
        PasswordValid --> FormReady
    }
    
    FormReady --> CreatingAccount: Continue Button
    
    state "Creating Account" as CreatingAccount {
        [*] --> SignupAPI: Email Signup
        [*] --> ProfileAPI: Wallet Signup
        SignupAPI --> ProfileAPI: Account Created
        ProfileAPI --> Success: Profile Saved
        ProfileAPI --> Error: Failed
        Error --> ShowForm: Retry
    }
    
    Success --> DispatchProfileUpdated
    DispatchProfileUpdated --> CloseModal
    CloseModal --> [*]
```

---

## Proposal/Voting System

### Proposal Stages State Machine

```mermaid
stateDiagram-v2
    [*] --> PendingReview
    
    state "Stage 1: Azura Review" as Stage1 {
        PendingReview --> Analyzing: AI Processing
        Analyzing --> Approved: Passes Criteria
        Analyzing --> Rejected: Fails Criteria
    }
    
    state "Stage 2: Blockchain" as Stage2 {
        Approved --> AwaitingTransaction: Create On-Chain
        AwaitingTransaction --> Processing: Transaction Sent
        Processing --> TransactionConfirmed: Success
        Processing --> TransactionFailed: Reverted
        TransactionFailed --> AwaitingTransaction: Retry
    }
    
    state "Stage 3: Community Vote" as Stage3 {
        TransactionConfirmed --> VotingNotStarted: Queued
        VotingNotStarted --> VotingActive: Voting Opens
        VotingActive --> VotingCompleted: Deadline Reached
        
        state "Vote Resolution" as Resolution {
            VotingCompleted --> QuorumMet: Min Votes Reached
            VotingCompleted --> QuorumFailed: Below Threshold
            QuorumMet --> Passed: For > Against
            QuorumMet --> Failed: Against >= For
        }
    }
    
    Passed --> Executed: Funds Distributed
    Failed --> Archived
    QuorumFailed --> Archived
    Rejected --> Archived
    
    Executed --> [*]
    Archived --> [*]
```

### Vote Button States

```mermaid
stateDiagram-v2
    [*] --> NotConnected
    
    NotConnected --> ConnectWallet: Vote Clicked
    ConnectWallet --> WalletConnected: Success
    
    state "Voting Ready" as Ready {
        WalletConnected --> ShowVoteOptions
        ShowVoteOptions --> ConfirmFor: Vote For
        ShowVoteOptions --> ConfirmAgainst: Vote Against
    }
    
    ConfirmFor --> Submitting: Confirm
    ConfirmAgainst --> Submitting: Confirm
    
    Submitting --> WaitingSignature: Tx Sent
    WaitingSignature --> WaitingConfirmation: Signed
    WaitingConfirmation --> VoteRecorded: Confirmed
    WaitingConfirmation --> VoteFailed: Reverted
    
    VoteFailed --> ShowVoteOptions: Retry
    VoteRecorded --> ShowResults: Refresh
    ShowResults --> [*]
```

---

## Quest System

```mermaid
stateDiagram-v2
    [*] --> QuestList
    
    state "Quest List View" as QuestList {
        [*] --> ShowActiveQuests
        ShowActiveQuests --> SelectQuest: Click Quest Card
    }
    
    SelectQuest --> QuestSidebar
    
    state "Quest Detail Sidebar" as QuestSidebar {
        [*] --> ShowQuestDetails
        ShowQuestDetails --> CheckQuestType
    }
    
    state "Quest Types" as CheckQuestType {
        CheckQuestType --> TwitterFollowQuest: twitter-follow
        CheckQuestType --> ManualQuest: manual
        CheckQuestType --> AutomaticQuest: automatic
    }
    
    state "Twitter Follow Quest" as TwitterFollowQuest {
        [*] --> CheckXConnection
        CheckXConnection --> PromptConnect: Not Connected
        CheckXConnection --> CheckFollow: Connected
        PromptConnect --> XAuthFlow: Connect X
        XAuthFlow --> CheckFollow: Success
        CheckFollow --> NotFollowing: Follow Check
        CheckFollow --> AlreadyFollowing: Already Follows
        NotFollowing --> FollowPrompt: Show Button
        FollowPrompt --> VerifyFollow: User Follows
        VerifyFollow --> QuestComplete: Confirmed
        AlreadyFollowing --> QuestComplete
    }
    
    state "Quest Completion" as QuestComplete {
        [*] --> AwardShards
        AwardShards --> ShowAnimation: Shards Added
        ShowAnimation --> UpdateNavbar: Animation Done
        UpdateNavbar --> CloseSidebar
    }
    
    CloseSidebar --> QuestList
```

### Shard Animation Flow

```mermaid
stateDiagram-v2
    [*] --> Triggered
    
    state "Reward Animation" as Animation {
        Triggered --> ShowConfetti: Start
        ShowConfetti --> ShardCounter: Particles Spawn
        ShardCounter --> CountUp: Animate Count
        CountUp --> DisplayTotal: Target Reached
    }
    
    DisplayTotal --> Cleanup: 5s Timer
    Cleanup --> DispatchUpdate: Clear Animation
    DispatchUpdate --> [*]
```

---

## Navigation State Machine

```mermaid
stateDiagram-v2
    [*] --> Navbar
    
    state "Navbar Component" as Navbar {
        [*] --> FetchUserData
        FetchUserData --> DisplayUser: Data Loaded
        FetchUserData --> NoUser: No Session
        
        state "User Display" as DisplayUser {
            [*] --> ShowAvatar
            ShowAvatar --> ShowShards: Avatar Loaded
            ShowShards --> ShowUsername: Count Displayed
        }
        
        state "Profile Dropdown" as Dropdown {
            ShowUsername --> DropdownClosed
            DropdownClosed --> DropdownOpen: Click Profile
            DropdownOpen --> DropdownClosed: Click Outside
            DropdownOpen --> AvatarSelector: Select Avatar
            DropdownOpen --> AccountsModal: Manage Accounts
            DropdownOpen --> SigningOut: Sign Out
        }
    }
    
    SigningOut --> Logout
    
    state "Logout Flow" as Logout {
        [*] --> DisconnectWallet
        DisconnectWallet --> ClearSession
        ClearSession --> ClearState
        ClearState --> RedirectLanding
    }
    
    RedirectLanding --> [*]
```

---

## Component Event Communication

```mermaid
stateDiagram-v2
    direction LR
    
    state "Window Events" as Events {
        profileUpdated: profileUpdated
        shardsUpdated: shardsUpdated
        xAccountUpdated: xAccountUpdated
        userLoggedIn: userLoggedIn
    }
    
    state "Event Producers" as Producers {
        OnboardingModal --> profileUpdated: Profile Created
        AvatarSelection --> profileUpdated: Avatar Changed
        QuestComplete --> shardsUpdated: Shards Awarded
        XAuthCallback --> xAccountUpdated: X Connected
        LoginSuccess --> userLoggedIn: User Authenticated
    }
    
    state "Event Consumers" as Consumers {
        profileUpdated --> Navbar: Refresh User Data
        profileUpdated --> HomePage: Check Avatar
        shardsUpdated --> Navbar: Update Count
        xAccountUpdated --> QuestSidebar: Refresh Status
        userLoggedIn --> WalletHandler: Update State
    }
```

---

## Summary

The Mental Wealth Academy application consists of several interconnected state machines:

| Component | States | Key Transitions |
|-----------|--------|-----------------|
| **Authentication** | 3 | Landing → Sign In/Sign Up → Onboarding → Home |
| **Onboarding** | 3 | Account → Profile → Avatar |
| **Proposal Stages** | 9 | Review → Blockchain → Vote → Execute |
| **Quest System** | 5 | List → Detail → Action → Complete → Reward |
| **Ideas Feed** | 4 | Load → Display → Swipe → Complete |

### Key Design Patterns

1. **Session-Based Auth**: Uses HTTP-only cookies with optional wallet integration
2. **Event-Driven Updates**: Components communicate via window events (`profileUpdated`, `shardsUpdated`)
3. **Optimistic UI**: States update immediately with async confirmation
4. **Progressive Disclosure**: Complex flows broken into discrete steps (onboarding, voting)
5. **AI Co-Pilot**: Azura daemon participates in proposal review
6. **Simplified Auth Flow**: Separate Sign In and Sign Up tabs with clear user intent - no waterfall pattern
