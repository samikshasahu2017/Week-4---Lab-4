#!/usr/bin/env node

/**
 * Student Account Management System - Node.js Implementation
 * 
 * This application is a Node.js port of the legacy COBOL application.
 * It preserves the original business logic, menu structure, and data integrity
 * from the COBOL version (main.cob, operations.cob, data.cob).
 * 
 * Business Rules:
 * - Initial account balance: 1000.00
 * - Credit operations: Always allowed, add funds to balance
 * - Debit operations: Only allowed if sufficient funds available
 * - Balance precision: Two decimal places (currency format)
 * - Balance persistence: Within current session
 */

const readline = require('readline');

/**
 * DataLayer - Mimics the functionality of data.cob
 * Responsible for balance storage and retrieval
 */
class DataLayer {
  constructor() {
    // STORAGE-BALANCE equivalent - Initial value 1000.00
    this.balance = 1000.00;
  }

  /**
   * READ operation - Retrieve current balance
   * Equivalent to COBOL: CALL 'DataProgram' USING 'READ'
   */
  read() {
    return this.balance;
  }

  /**
   * WRITE operation - Update balance in storage
   * Equivalent to COBOL: CALL 'DataProgram' USING 'WRITE'
   */
  write(newBalance) {
    this.balance = parseFloat(newBalance.toFixed(2));
  }

  /**
   * Get current balance with proper formatting
   */
  getFormattedBalance() {
    return this.balance.toFixed(2);
  }
}

/**
 * OperationsLayer - Mimics the functionality of operations.cob
 * Responsible for business logic: balance viewing, credits, and debits
 */
class OperationsLayer {
  constructor(dataLayer) {
    this.dataLayer = dataLayer;
  }

  /**
   * TOTAL operation - View current balance
   * Equivalent to COBOL: CALL 'Operations' USING 'TOTAL'
   */
  viewBalance() {
    const currentBalance = this.dataLayer.read();
    console.log(`Current balance: ${currentBalance.toFixed(2)}`);
    return currentBalance;
  }

  /**
   * CREDIT operation - Add funds to account
   * Equivalent to COBOL: CALL 'Operations' USING 'CREDIT'
   */
  creditAccount(amount) {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      console.log('Invalid amount entered.');
      return false;
    }

    const currentBalance = this.dataLayer.read();
    const newBalance = currentBalance + parsedAmount;
    this.dataLayer.write(newBalance);
    console.log(`Amount credited. New balance: ${newBalance.toFixed(2)}`);
    return true;
  }

  /**
   * DEBIT operation - Withdraw funds from account
   * Equivalent to COBOL: CALL 'Operations' USING 'DEBIT'
   * 
   * Business Rule: Only allow debit if sufficient funds available
   */
  debitAccount(amount) {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      console.log('Invalid amount entered.');
      return false;
    }

    const currentBalance = this.dataLayer.read();

    // Business Rule Check - Equivalent to COBOL validation
    if (currentBalance < parsedAmount) {
      console.log('Insufficient funds for this debit.');
      return false;
    }

    const newBalance = currentBalance - parsedAmount;
    this.dataLayer.write(newBalance);
    console.log(`Amount debited. New balance: ${newBalance.toFixed(2)}`);
    return true;
  }
}

/**
 * MainProgram - Mimics the functionality of main.cob
 * Responsible for menu display and user interaction
 */
class MainProgram {
  constructor() {
    this.dataLayer = new DataLayer();
    this.operationsLayer = new OperationsLayer(this.dataLayer);
    this.continueFlag = true;

    // Setup readline interface for user input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Display the main menu
   * Equivalent to COBOL: DISPLAY menu options
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Process user choice
   * Equivalent to COBOL: EVALUATE USER-CHOICE
   */
  async processChoice(choice) {
    const userChoice = parseInt(choice);

    switch (userChoice) {
      case 1:
        // View Balance - Equivalent to COBOL: WHEN 1, CALL 'Operations' USING 'TOTAL'
        this.operationsLayer.viewBalance();
        break;

      case 2:
        // Credit Account - Equivalent to COBOL: WHEN 2, CALL 'Operations' USING 'CREDIT'
        const creditAmount = await this.prompt('Enter credit amount: ');
        this.operationsLayer.creditAccount(creditAmount);
        break;

      case 3:
        // Debit Account - Equivalent to COBOL: WHEN 3, CALL 'Operations' USING 'DEBIT'
        const debitAmount = await this.prompt('Enter debit amount: ');
        this.operationsLayer.debitAccount(debitAmount);
        break;

      case 4:
        // Exit - Equivalent to COBOL: WHEN 4, SET CONTINUE-FLAG TO 'NO'
        this.continueFlag = false;
        break;

      default:
        // Invalid choice - Equivalent to COBOL: WHEN OTHER
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Utility function to prompt user for input
   */
  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Main program loop
   * Equivalent to COBOL: PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  async runMainLoop() {
    while (this.continueFlag) {
      this.displayMenu();
      const choice = await this.prompt('Enter your choice (1-4): ');
      await this.processChoice(choice);
      console.log(''); // Blank line for readability
    }
  }

  /**
   * Start the application
   */
  async start() {
    try {
      await this.runMainLoop();
      console.log('Exiting the program. Goodbye!');
      this.rl.close();
      process.exit(0);
    } catch (error) {
      console.error('An error occurred:', error.message);
      this.rl.close();
      process.exit(1);
    }
  }
}

/**
 * Application Entry Point
 * Equivalent to COBOL: IDENTIFICATION DIVISION, PROGRAM-ID. MainProgram
 */
if (require.main === module) {
  const app = new MainProgram();
  app.start();
}

module.exports = { MainProgram, OperationsLayer, DataLayer };
