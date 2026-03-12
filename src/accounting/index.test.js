/**
 * Unit Tests for Student Account Management System
 * 
 * These tests mirror the scenarios documented in docs/TESTPLAN.md
 * and validate the business logic of the Node.js port of the COBOL application.
 */

const { MainProgram, OperationsLayer, DataLayer } = require('./index');

describe('DataLayer - Data Storage and Retrieval', () => {
  let dataLayer;

  beforeEach(() => {
    dataLayer = new DataLayer();
  });

  describe('Initialization', () => {
    test('TC-001: Initial balance should be 1000.00 (mirrors COBOL data.cob)', () => {
      expect(dataLayer.read()).toBe(1000.00);
    });
  });

  describe('READ Operation', () => {
    test('TC-002: READ operation should return current balance', () => {
      const balance = dataLayer.read();
      expect(balance).toBe(1000.00);
    });

    test('Should return updated balance after WRITE operation', () => {
      dataLayer.write(1500.00);
      const balance = dataLayer.read();
      expect(balance).toBe(1500.00);
    });
  });

  describe('WRITE Operation', () => {
    test('TC-023: WRITE operation should update balance in storage', () => {
      dataLayer.write(2000.00);
      expect(dataLayer.read()).toBe(2000.00);
    });

    test('TC-024: Balance should maintain two decimal places precision', () => {
      dataLayer.write(1000.99);
      expect(dataLayer.getFormattedBalance()).toBe('1000.99');
    });

    test('Should handle decimal precision correctly', () => {
      dataLayer.write(1234.567);
      expect(dataLayer.read()).toBe(1234.57); // Rounded to 2 decimal places
    });

    test('Should handle very small amounts', () => {
      dataLayer.write(0.01);
      expect(dataLayer.read()).toBe(0.01);
    });

    test('Should handle large amounts', () => {
      dataLayer.write(999999.99);
      expect(dataLayer.read()).toBe(999999.99);
    });
  });

  describe('Balance Formatting', () => {
    test('TC-024: getFormattedBalance should return properly formatted string', () => {
      dataLayer.write(1000.00);
      expect(dataLayer.getFormattedBalance()).toBe('1000.00');
    });

    test('Should format amounts with one decimal place', () => {
      dataLayer.write(1000.1);
      expect(dataLayer.getFormattedBalance()).toBe('1000.10');
    });
  });
});

describe('OperationsLayer - Business Logic', () => {
  let operationsLayer;
  let dataLayer;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operationsLayer = new OperationsLayer(dataLayer);
  });

  describe('View Balance Operation (TOTAL)', () => {
    test('TC-003: View Balance should display initial balance of 1000.00', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.viewBalance();
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
      consoleSpy.mockRestore();
    });

    test('TC-028: View Balance should display current balance after transactions', () => {
      dataLayer.write(1500.00);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.viewBalance();
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1500.00');
      consoleSpy.mockRestore();
    });

    test('Should return the current balance value', () => {
      const balance = operationsLayer.viewBalance();
      expect(balance).toBe(1000.00);
    });
  });

  describe('Credit Account Operation (CREDIT)', () => {
    test('TC-009: Credit Account should add funds and display new balance', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.creditAccount(500.00);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
      expect(dataLayer.read()).toBe(1500.00);
      consoleSpy.mockRestore();
    });

    test('TC-010: Credit small amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.creditAccount(0.01);
      
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.01');
      expect(dataLayer.read()).toBe(1000.01);
      consoleSpy.mockRestore();
    });

    test('TC-011: Credit large amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.creditAccount(999999.00);
      
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000999.00');
      expect(dataLayer.read()).toBe(1000999.00);
      consoleSpy.mockRestore();
    });

    test('TC-012: Multiple sequential credits should persist', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      operationsLayer.creditAccount(100.00);
      expect(dataLayer.read()).toBe(1100.00);
      
      operationsLayer.creditAccount(200.00);
      expect(dataLayer.read()).toBe(1300.00);
      
      const balance = operationsLayer.viewBalance();
      expect(balance).toBe(1300.00);
      
      consoleSpy.mockRestore();
    });

    test('Should handle string input and convert to float', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.creditAccount('250.50');
      
      expect(result).toBe(true);
      expect(dataLayer.read()).toBe(1250.50);
      consoleSpy.mockRestore();
    });

    test('Should accept zero amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.creditAccount(0.00);
      
      expect(result).toBe(true);
      expect(dataLayer.read()).toBe(1000.00);
      consoleSpy.mockRestore();
    });

    test('TC-030: Should reject negative credit amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.creditAccount(-100.00);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid amount entered.');
      expect(dataLayer.read()).toBe(1000.00); // Balance unchanged
      consoleSpy.mockRestore();
    });

    test('TC-032: Should reject non-numeric input for amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.creditAccount('ABC');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid amount entered.');
      consoleSpy.mockRestore();
    });
  });

  describe('Debit Account Operation (DEBIT)', () => {
    test('TC-013: Debit with sufficient funds should subtract and display new balance', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(250.00);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 750.00');
      expect(dataLayer.read()).toBe(750.00);
      consoleSpy.mockRestore();
    });

    test('TC-014: Debit amount equal to balance should result in zero balance', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(1000.00);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
      expect(dataLayer.read()).toBe(0.00);
      consoleSpy.mockRestore();
    });

    test('TC-015: Debit small amount', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(0.01);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 999.99');
      expect(dataLayer.read()).toBe(999.99);
      consoleSpy.mockRestore();
    });

    test('TC-016: Debit with amount exceeding balance should fail with error message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(1000.01);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      expect(dataLayer.read()).toBe(1000.00); // Balance unchanged
      consoleSpy.mockRestore();
    });

    test('TC-017: Debit with amount significantly exceeding balance should fail', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(5000.00);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      expect(dataLayer.read()).toBe(1000.00);
      consoleSpy.mockRestore();
    });

    test('TC-018: Debit zero amount should succeed', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(0.00);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
      expect(dataLayer.read()).toBe(1000.00);
      consoleSpy.mockRestore();
    });

    test('TC-026: Debit operation display message on success', () => {
      dataLayer.write(100.00);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.debitAccount(25.00);
      
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 75.00');
      consoleSpy.mockRestore();
    });

    test('TC-027: Debit operation display message on failure', () => {
      dataLayer.write(100.00);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      operationsLayer.debitAccount(150.00);
      
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      consoleSpy.mockRestore();
    });

    test('TC-031: Debit with negative amount should be rejected', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount(-100.00);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid amount entered.');
      expect(dataLayer.read()).toBe(1000.00);
      consoleSpy.mockRestore();
    });

    test('TC-032: Debit with non-numeric input should be rejected', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount('ABC');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid amount entered.');
      consoleSpy.mockRestore();
    });

    test('Should handle string input and convert to float', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = operationsLayer.debitAccount('250.50');
      
      expect(result).toBe(true);
      expect(dataLayer.read()).toBe(749.50);
      consoleSpy.mockRestore();
    });
  });

  describe('Transaction Scenarios', () => {
    test('TC-019: Debit after credit with sufficient funds', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      operationsLayer.creditAccount(500.00);
      expect(dataLayer.read()).toBe(1500.00);
      
      operationsLayer.debitAccount(300.00);
      expect(dataLayer.read()).toBe(1200.00);
      
      consoleSpy.mockRestore();
    });

    test('TC-020: Debit after credit with insufficient funds for debit', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      operationsLayer.creditAccount(500.00);
      expect(dataLayer.read()).toBe(1500.00);
      
      const result = operationsLayer.debitAccount(2000.00);
      expect(result).toBe(false);
      expect(dataLayer.read()).toBe(1500.00); // Balance unchanged
      
      consoleSpy.mockRestore();
    });

    test('TC-021: Complex scenario with multiple mixed operations', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Step 1: View balance
      operationsLayer.viewBalance();
      expect(dataLayer.read()).toBe(1000.00);
      
      // Step 2: Credit 250.00
      operationsLayer.creditAccount(250.00);
      expect(dataLayer.read()).toBe(1250.00);
      
      // Step 3: View balance
      operationsLayer.viewBalance();
      expect(dataLayer.read()).toBe(1250.00);
      
      // Step 4: Debit 400.00
      operationsLayer.debitAccount(400.00);
      expect(dataLayer.read()).toBe(850.00);
      
      // Step 5: View balance
      operationsLayer.viewBalance();
      expect(dataLayer.read()).toBe(850.00);
      
      // Step 6: Credit 100.00
      operationsLayer.creditAccount(100.00);
      expect(dataLayer.read()).toBe(950.00);
      
      // Step 7: View balance
      operationsLayer.viewBalance();
      expect(dataLayer.read()).toBe(950.00);
      
      consoleSpy.mockRestore();
    });

    test('TC-034: Transaction atomicity - failed debit does not modify balance', () => {
      dataLayer.write(100.00);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Attempt invalid debit
      const result = operationsLayer.debitAccount(150.00);
      expect(result).toBe(false);
      
      // View balance to verify it's unchanged
      operationsLayer.viewBalance();
      expect(dataLayer.read()).toBe(100.00);
      
      consoleSpy.mockRestore();
    });

    test('TC-035: Boundary test - maximum balance value', () => {
      dataLayer.write(999800.00);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      operationsLayer.creditAccount(199.99);
      expect(dataLayer.read()).toBe(999999.99);
      
      operationsLayer.viewBalance();
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 999999.99');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('MainProgram - Menu and User Interaction', () => {
  let mainProgram;

  beforeEach(() => {
    mainProgram = new MainProgram();
  });

  describe('Initialization', () => {
    test('TC-001: MainProgram should initialize with correct default values', () => {
      expect(mainProgram.continueFlag).toBe(true);
      expect(mainProgram.dataLayer).toBeDefined();
      expect(mainProgram.operationsLayer).toBeDefined();
      expect(mainProgram.rl).toBeDefined();
    });

    test('Should have initial balance of 1000.00', () => {
      expect(mainProgram.dataLayer.read()).toBe(1000.00);
    });
  });

  describe('Menu Display', () => {
    test('TC-002: Menu should display all four options', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mainProgram.displayMenu();
      
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      expect(calls).toContain('1. View Balance');
      expect(calls).toContain('2. Credit Account');
      expect(calls).toContain('3. Debit Account');
      expect(calls).toContain('4. Exit');
      
      consoleSpy.mockRestore();
    });

    test('Should display menu separator lines', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mainProgram.displayMenu();
      
      const calls = consoleSpy.mock.calls.map(call => call[0]);
      expect(calls).toContain('--------------------------------');
      expect(calls).toContain('Account Management System');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Choice Processing', () => {
    test('TC-003: Processing choice 1 should view balance', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await mainProgram.processChoice(1);
      
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
      consoleSpy.mockRestore();
    });

    test('TC-004: Processing choice 4 should set exit flag', async () => {
      expect(mainProgram.continueFlag).toBe(true);
      await mainProgram.processChoice(4);
      expect(mainProgram.continueFlag).toBe(false);
    });

    test('TC-005: Invalid choice should display error message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await mainProgram.processChoice('A');
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
      consoleSpy.mockRestore();
    });

    test('TC-006: Choice 5 should be invalid', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await mainProgram.processChoice(5);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
      consoleSpy.mockRestore();
    });

    test('TC-007: Choice 0 should be invalid', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await mainProgram.processChoice(0);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
      consoleSpy.mockRestore();
    });

    test('TC-008: Negative choice should be invalid', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await mainProgram.processChoice(-1);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
      consoleSpy.mockRestore();
    });
  });

  describe('Credit Operation via ProcessChoice', () => {
    test('TC-002: Processing choice 2 with credit amount should update balance', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mainProgram.prompt = jest.fn().mockResolvedValue('100.00');
      
      await mainProgram.processChoice(2);
      
      expect(mainProgram.dataLayer.read()).toBe(1100.00);
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1100.00');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Debit Operation via ProcessChoice', () => {
    test('TC-003: Processing choice 3 with debit amount should update balance', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mainProgram.prompt = jest.fn().mockResolvedValue('250.00');
      
      await mainProgram.processChoice(3);
      
      expect(mainProgram.dataLayer.read()).toBe(750.00);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 750.00');
      
      consoleSpy.mockRestore();
    });

    test('TC-016: Processing choice 3 with insufficient funds should fail', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mainProgram.prompt = jest.fn().mockResolvedValue('1000.01');
      
      await mainProgram.processChoice(3);
      
      expect(mainProgram.dataLayer.read()).toBe(1000.00); // Unchanged
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Program Loop', () => {
    test('TC-022: Menu should reappear after each operation', () => {
      // This is implicitly tested by the fact that processChoice doesn't
      // change continueFlag (except for choice 4), allowing the loop to continue
      expect(mainProgram.continueFlag).toBe(true);
      
      // After processing choice 1, 2, or 3, continueFlag should still be true
      mainProgram.processChoice(1);
      expect(mainProgram.continueFlag).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  test('Complete user session with multiple operations', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mainProgram = new MainProgram();
    
    // Initial balance check
    expect(mainProgram.dataLayer.read()).toBe(1000.00);
    
    // Credit 500
    mainProgram.operationsLayer.creditAccount(500.00);
    expect(mainProgram.dataLayer.read()).toBe(1500.00);
    
    // Debit 300
    mainProgram.operationsLayer.debitAccount(300.00);
    expect(mainProgram.dataLayer.read()).toBe(1200.00);
    
    // Credit 100
    mainProgram.operationsLayer.creditAccount(100.00);
    expect(mainProgram.dataLayer.read()).toBe(1300.00);
    
    // Attempt invalid debit (fails)
    const invalidResult = mainProgram.operationsLayer.debitAccount(2000.00);
    expect(invalidResult).toBe(false);
    expect(mainProgram.dataLayer.read()).toBe(1300.00); // Unchanged
    
    // Valid debit
    mainProgram.operationsLayer.debitAccount(300.00);
    expect(mainProgram.dataLayer.read()).toBe(1000.00);
    
    consoleSpy.mockRestore();
  });

  test('Multiple instances should have independent balances', () => {
    const mainProgram1 = new MainProgram();
    const mainProgram2 = new MainProgram();
    
    mainProgram1.operationsLayer.creditAccount(500.00);
    expect(mainProgram1.dataLayer.read()).toBe(1500.00);
    
    // mainProgram2 should still have initial balance
    expect(mainProgram2.dataLayer.read()).toBe(1000.00);
  });
});
