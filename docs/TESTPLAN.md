# Test Plan: Student Account Management System (COBOL)

**Document Purpose:** This test plan defines the test cases for validating the business logic and implementation of the Student Account Management System COBOL application. This test plan will be used to create unit and integration tests in a Node.js migration.

**Application Version:** 1.0  
**Last Updated:** March 12, 2026

---

## Executive Summary

The Student Account Management System is a COBOL-based application that manages student bank accounts with operations for viewing balance, crediting, and debiting funds. This test plan covers all functional requirements and business rules to ensure the system behaves correctly across various scenarios.

---

## Test Case Matrix

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | System Startup | System is not running | 1. Compile the application using `cobc -x src/cobol/main.cob src/cobol/operations.cob src/cobol/data.cob -o accountsystem`<br/>2. Execute `./accountsystem` | Main menu is displayed with options 1-4 visible. Program is awaiting user input. Initial balance in storage is 1000.00 | | | |
| TC-002 | Menu Display - All Options Visible | System has started successfully | 1. Observe the main menu output | Menu displays exactly four options: (1) View Balance, (2) Credit Account, (3) Debit Account, (4) Exit | | | |
| TC-003 | Select Option 1 - View Balance (Initial) | System is running, viewing menu for first time, balance is 1000.00 | 1. User enters choice: 1<br/>2. Observe output | Display shows "Current balance: 1000.00" and returns to main menu | | | |
| TC-004 | Select Option 4 - Exit Program | System is running, viewing main menu | 1. User enters choice: 4 | Program displays "Exiting the program. Goodbye!" and terminates normally | | | |
| TC-005 | Invalid Menu Input - Character | System is running, viewing main menu | 1. User enters choice: "A" (or any non-numeric character) | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-006 | Invalid Menu Input - Out of Range (5) | System is running, viewing main menu | 1. User enters choice: 5 | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-007 | Invalid Menu Input - Out of Range (0) | System is running, viewing main menu | 1. User enters choice: 0 | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-008 | Invalid Menu Input - Negative Number | System is running, viewing main menu | 1. User enters choice: -1 | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-009 | Credit Account - Valid Amount | System is running (balance = 1000.00) | 1. User enters choice: 2<br/>2. System prompts for credit amount<br/>3. User enters amount: 500.00 | System displays "Amount credited. New balance: 1500.00" and returns to menu. Balance is updated in storage. | | | |
| TC-010 | Credit Account - Small Amount | System is running (balance = 1000.00) | 1. User enters choice: 2<br/>2. System prompts for credit amount<br/>3. User enters amount: 0.01 | System displays "Amount credited. New balance: 1000.01" and returns to menu. Balance is updated in storage. | | | |
| TC-011 | Credit Account - Large Amount | System is running (balance = 1000.00) | 1. User enters choice: 2<br/>2. System prompts for credit amount<br/>3. User enters amount: 999999.00 | System displays "Amount credited. New balance: 1000999.00" and returns to menu. Balance is updated in storage. | | | |
| TC-012 | Credit Account - Multiple Sequential Credits | System is running (balance = 1000.00) | 1. User enters choice: 2, amount: 100.00<br/>2. User enters choice: 2, amount: 200.00<br/>3. User enters choice: 1 (View Balance) | New balance after first credit: 1100.00<br/>New balance after second credit: 1300.00<br/>Final balance display: 1300.00<br/>Data persists across multiple transactions | | | Validates persistence across transactions |
| TC-013 | Debit Account - Valid Amount (Sufficient Funds) | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 250.00 | System displays "Amount debited. New balance: 750.00" and returns to menu. Balance is updated in storage. | | | |
| TC-014 | Debit Account - Amount Equals Balance | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 1000.00 | System displays "Amount debited. New balance: 0.00" and returns to menu. Balance is updated to exactly zero. | | | Edge case: full account withdrawal |
| TC-015 | Debit Account - Small Amount | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 0.01 | System displays "Amount debited. New balance: 999.99" and returns to menu. Balance is updated in storage. | | | Validates decimal precision |
| TC-016 | Debit Account - Insufficient Funds | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 1000.01 | System displays "Insufficient funds for this debit." and returns to menu. Balance remains 1000.00 (unchanged). | | | Critical business rule: funds validation |
| TC-017 | Debit Account - Amount Exceeds Balance Significantly | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 5000.00 | System displays "Insufficient funds for this debit." and returns to menu. Balance remains 1000.00 (unchanged). | | | |
| TC-018 | Debit Account - Zero Amount | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for debit amount<br/>3. User enters amount: 0.00 | System displays "Amount debited. New balance: 1000.00" and returns to menu. No change to balance. | | | Edge case: zero debit |
| TC-019 | Debit After Credit - Sufficient Funds | System is running (balance = 1000.00) | 1. User enters choice: 2, amount: 500.00 (balance now 1500.00)<br/>2. User enters choice: 3, amount: 300.00 | Credit operation updates balance to 1500.00<br/>Debit operation updates balance to 1200.00<br/>Final balance displayed: 1200.00 | | | |
| TC-020 | Debit After Credit - Insufficient Funds for Debit | System is running (balance = 1000.00) | 1. User enters choice: 2, amount: 500.00 (balance now 1500.00)<br/>2. User enters choice: 3, amount: 2000.00 | Credit operation updates balance to 1500.00<br/>Debit operation fails with "Insufficient funds for this debit." message<br/>Final balance remains 1500.00 | | | |
| TC-021 | Complex Scenario - Multiple Mixed Operations | System is running (balance = 1000.00) | 1. User enters choice: 1 (View)<br/>2. User enters choice: 2, amount: 250.00<br/>3. User enters choice: 1 (View)<br/>4. User enters choice: 3, amount: 400.00<br/>5. User enters choice: 1 (View)<br/>6. User enters choice: 2, amount: 100.00<br/>7. User enters choice: 1 (View) | Step 1: Display 1000.00<br/>Step 2: Credit 250.00 → 1250.00<br/>Step 3: Display 1250.00<br/>Step 4: Debit 400.00 → 850.00<br/>Step 5: Display 850.00<br/>Step 6: Credit 100.00 → 950.00<br/>Step 7: Display 950.00<br/>All operations succeed and balance updates correctly | | | Validates overall system integrity |
| TC-022 | Menu Loop - Return to Menu After Operations | System is running | 1. User enters choice: 2, amount: 100.00<br/>2. Observe menu reappears<br/>3. User enters choice: 1<br/>4. Observe menu reappears<br/>5. User enters choice: 3, amount: 50.00<br/>6. Observe menu reappears | After each operation (1, 2, or 3), the main menu is redisplayed and system awaits next input without terminating | | | Validates loop continuation |
| TC-023 | Initial Balance Integrity | System restarted | 1. Compile and run new instance of the application | System displays initial balance of exactly 1000.00 when viewing balance on first operation | | | Validates initial value is set correctly |
| TC-024 | Balance Precision - Decimal Places | System is running (balance = 1000.00) | 1. User enters choice: 2, amount: 0.99<br/>2. User enters choice: 1 (View) | Balance is displayed as "1000.99" with exactly two decimal places | | | Validates currency format (PIC 9(6)V99) |
| TC-025 | Credit Operation Display Message | System is running (balance = 100.00) | 1. User enters choice: 2<br/>2. System prompts "Enter credit amount: "<br/>3. User enters: 50.00 | System displays exactly: "Amount credited. New balance: 150.00" | | | |
| TC-026 | Debit Operation Display Message - Success | System is running (balance = 100.00) | 1. User enters choice: 3<br/>2. System prompts "Enter debit amount: "<br/>3. User enters: 25.00 | System displays exactly: "Amount debited. New balance: 75.00" | | | |
| TC-027 | Debit Operation Display Message - Failure | System is running (balance = 100.00) | 1. User enters choice: 3<br/>2. System prompts "Enter debit amount: "<br/>3. User enters: 150.00 | System displays exactly: "Insufficient funds for this debit." | | | |
| TC-028 | View Balance Operation Display Message | System is running (balance = 1500.00) | 1. User enters choice: 1 | System displays exactly: "Current balance: 1500.00" | | | |
| TC-029 | Balance Boundary - Maximum Value | System is running (balance = 999800.00) | 1. User enters choice: 2, amount: 199.99<br/>2. User enters choice: 1 (View) | Balance updates to 999999.99 (maximum allowed by PIC 9(6)V99)<br/>Display shows: "Current balance: 999999.99" | | | Boundary test: maximum supported balance |
| TC-030 | Negative Input for Amount - Credit | System is running (balance = 1000.00) | 1. User enters choice: 2<br/>2. System prompts for amount<br/>3. User enters: -100.00 | System behavior depends on input validation. If accepted: balance becomes 900.00. If rejected: error message or invalid input | | | Note: Current implementation may accept negative amounts |
| TC-031 | Negative Input for Amount - Debit | System is running (balance = 1000.00) | 1. User enters choice: 3<br/>2. System prompts for amount<br/>3. User enters: -100.00 | System behavior depends on input validation. If operation subtracts: balance becomes 1100.00 (reverse of intended). If rejected: error message or invalid input | | | Note: Current implementation may accept negative amounts |
| TC-032 | Non-numeric Input for Amount | System is running | 1. User selects option 2 (Credit)<br/>2. System prompts for amount<br/>3. User enters: "ABC" | System behavior depends on input validation. Expected: error or reprompt. Actual behavior to be tested. | | | |
| TC-033 | Program Termination | System is running | 1. User enters choice: 4 | Program ends cleanly with message "Exiting the program. Goodbye!"<br/>Exit code is 0 (success) | | | |
| TC-034 | Memory/Storage Persistence Within Session | System is running | 1. Open application<br/>2. Perform multiple credit and debit operations<br/>3. Verify balance updates persist across each operation | All balance changes persist within the session. Final balance correctly reflects the sum of all transactions. | | | Validates STORAGE-BALANCE is properly maintained |
| TC-035 | Transaction Atomicity - Debit Failure Doesn't Modify Balance | System is running (balance = 100.00) | 1. User enters choice: 3, amount: 150.00 (fails)<br/>2. Wait for error message<br/>3. User enters choice: 1 (View balance)<br/>4. Verify balance | Debit fails with insufficient funds message<br/>Balance remains 100.00 (unchanged from step 3) | | | Validates failed transaction doesn't corrupt balance |

---

## Test Coverage Summary

### Functional Areas Covered:
- ✅ Main menu display and navigation
- ✅ Input validation (menu choices)
- ✅ View Balance operation
- ✅ Credit Account operation
- ✅ Debit Account operation with sufficient funds
- ✅ Debit Account operation with insufficient funds
- ✅ Error handling and messages
- ✅ Balance persistence within session
- ✅ Decimal precision (currency format)
- ✅ Program loop and exit functionality
- ✅ Transaction integrity and atomicity

### Business Rules Validated:
- ✅ Initial balance is 1000.00
- ✅ Debit requests exceeding balance are rejected
- ✅ Credit requests are always accepted
- ✅ Balance is maintained with two decimal places
- ✅ Balance updates persist across multiple transactions
- ✅ Failed debit operations don't modify balance
- ✅ Program loops until explicit exit (option 4)

### Known Limitations / Areas for Future Testing:
- Input validation for non-numeric amount entries (TC-032, TC-030, TC-031)
- Handling of negative amounts in credit/debit operations
- Maximum value boundary testing
- Concurrency testing (not applicable to single-user COBOL app)
- Performance/stress testing with many transactions

---

## Notes for Node.js Migration

When creating unit and integration tests in Node.js, use this test plan as the specification. Consider the following mapping:

| COBOL Component | Node.js Equivalent | Test Type |
|---|---|---|
| main.cob (Menu/UI) | Express routes / CLI interface | Integration tests |
| operations.cob (Business Logic) | Service layer functions | Unit tests |
| data.cob (Data Storage) | Database/Data layer | Unit tests |
| Program flow loops | Async/await patterns | Integration tests |

Each test case can be converted to a Jest, Mocha, or similar testing framework test with appropriate assertions.
