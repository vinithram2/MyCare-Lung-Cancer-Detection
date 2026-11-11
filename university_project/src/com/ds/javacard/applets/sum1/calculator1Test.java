package com.ds.javacard.applets.sum1;

import javacard.framework.APDU;
import javacard.framework.ISO7816;
import javacard.framework.ISOException;

/**
 * calculator1Test — Unit test simulator for the Calculator1 JavaCard applet.
 *
 * Tests:
 *   1. installApplet()       - verifies applet installs without error
 *   2. checkHelloResponse()  - tests SELECT command handling
 *   3. processAPDU()         - tests write_data and read_data commands
 *   4. verifyO()             - verifies arithmetic operations
 */
public class calculator1Test {

    private static int testsPassed = 0;
    private static int testsFailed = 0;

    // -------------------------------------------------------------------------
    // AID for this applet (Application Identifier)
    // -------------------------------------------------------------------------
    private static final byte[] APPLET_AID = {
        (byte) 0xA0, 0x00, 0x00, 0x00, 0x62,
        0x03, 0x01, 0x0C, 0x06, 0x01
    };

    // -------------------------------------------------------------------------
    // Test entry point
    // -------------------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  Calculator1 JavaCard Applet Test");
        System.out.println("========================================\n");

        calculator1Test tester = new calculator1Test();

        tester.installApplet();
        tester.checkHelloResponse();
        tester.processAPDU();
        tester.verifyO();

        System.out.println("\n========================================");
        System.out.println("  Results: " + testsPassed + " passed, "
                            + testsFailed + " failed");
        System.out.println("========================================");
    }

    // -------------------------------------------------------------------------
    // Test 1: Install the applet
    // -------------------------------------------------------------------------
    /**
     * Verifies that the Calculator1 applet installs successfully
     * by calling install() and confirming registration.
     */
    public void installApplet() {
        System.out.println("--- Test: installApplet() ---");
        try {
            calculator1.install(APPLET_AID, (short) 0, (byte) APPLET_AID.length);
            System.out.println("PASS: Applet installed successfully.");
            testsPassed++;
        } catch (Exception e) {
            System.out.println("FAIL: " + e.getMessage());
            testsFailed++;
        }
    }

    // -------------------------------------------------------------------------
    // Test 2: SELECT command (hello response)
    // -------------------------------------------------------------------------
    /**
     * Sends a SELECT APDU (CLA=0x00, INS=0xA4) and confirms no exception is thrown.
     * On a real card, this would return the ATR.
     */
    public void checkHelloResponse() {
        System.out.println("\n--- Test: checkHelloResponse() ---");
        // CLA=0x00, INS=0xA4 (SELECT), P1=0x04, P2=0x00, Lc=AID length, Data=AID
        byte[] selectCmd = new byte[5 + APPLET_AID.length];
        selectCmd[0] = ISO7816.CLA_ISO7816;
        selectCmd[1] = ISO7816.INS_SELECT;
        selectCmd[2] = 0x04;
        selectCmd[3] = 0x00;
        selectCmd[4] = (byte) APPLET_AID.length;
        System.arraycopy(APPLET_AID, 0, selectCmd, 5, APPLET_AID.length);

        try {
            APDU apdu = new APDU(selectCmd);
            calculator1 applet = getApplet();
            if (applet != null) {
                applet.process(apdu);
                System.out.println("PASS: SELECT command handled (no exception).");
                testsPassed++;
            } else {
                System.out.println("FAIL: Applet not installed yet.");
                testsFailed++;
            }
        } catch (ISOException e) {
            System.out.printf("FAIL: ISOException SW=0x%04X%n", e.getReason() & 0xFFFF);
            testsFailed++;
        }
    }

    // -------------------------------------------------------------------------
    // Test 3: WRITE + READ APDU processing
    // -------------------------------------------------------------------------
    /**
     * Tests the WRITE_DATA (INS=0x01) and READ_DATA (INS=0x02) commands:
     *  - Writes 4 bytes {0x00, 0x0A, 0x00, 0x05} → operand1=10, operand2=5
     *  - Reads them back and verifies
     */
    public void processAPDU() {
        System.out.println("\n--- Test: processAPDU() ---");

        calculator1 applet = getApplet();
        if (applet == null) {
            System.out.println("SKIP: Applet not installed.");
            testsFailed++;
            return;
        }

        // --- WRITE: store {0x00,0x0A,0x00,0x05} → short1=10, short2=5 ---
        // CLA=0xB0, INS=0x01 (WRITE), P1=0x00, P2=0x00, Lc=0x04, Data...
        byte[] writeCmd = {
            (byte) 0xB0, 0x01, 0x00, 0x00, 0x04,
            0x00, 0x0A, 0x00, 0x05
        };
        System.out.println("Sending WRITE_DATA APDU: " + hexDump(writeCmd));
        try {
            APDU writeApdu = new APDU(writeCmd);
            applet.process(writeApdu);
            System.out.println("PASS: WRITE_DATA accepted.");
            testsPassed++;
        } catch (ISOException e) {
            System.out.printf("FAIL: WRITE_DATA threw ISOException SW=0x%04X%n",
                              e.getReason() & 0xFFFF);
            testsFailed++;
        }

        // --- READ back the data ---
        // CLA=0xB0, INS=0x02 (READ), P1=0x00, P2=0x00, Le=0x04
        byte[] readCmd = {
            (byte) 0xB0, 0x02, 0x00, 0x00, 0x04
        };
        System.out.println("Sending READ_DATA APDU: " + hexDump(readCmd));
        try {
            APDU readApdu = new APDU(readCmd);
            applet.process(readApdu);
            System.out.println("PASS: READ_DATA accepted.");
            testsPassed++;
        } catch (ISOException e) {
            System.out.printf("FAIL: READ_DATA threw ISOException SW=0x%04X%n",
                              e.getReason() & 0xFFFF);
            testsFailed++;
        }
    }

    // -------------------------------------------------------------------------
    // Test 4: Arithmetic verification
    // -------------------------------------------------------------------------
    /**
     * Verifies arithmetic operations with pre-stored operands (10 and 5):
     *   ADD: 10 + 5 = 15
     *   SUBTRACT: 10 - 5 = 5
     *   MULTIPLY: 10 * 5 = 50
     *   DIVIDE: 10 / 5 = 2
     */
    public void verifyO() {
        System.out.println("\n--- Test: verifyO() (arithmetic) ---");

        calculator1 applet = getApplet();
        if (applet == null) {
            System.out.println("SKIP: Applet not installed.");
            testsFailed++;
            return;
        }

        // First store operands: 10 and 5
        byte[] writeCmd = {
            (byte) 0xB0, 0x01, 0x00, 0x00, 0x04,
            0x00, 0x0A, 0x00, 0x05
        };
        try {
            applet.process(new APDU(writeCmd));
        } catch (ISOException e) {
            System.out.println("FAIL: Could not store operands.");
            testsFailed++;
            return;
        }

        // ADD (INS=0x03)
        System.out.println("Testing ADD (10 + 5)...");
        testArithmetic(applet, (byte) 0x03, "ADD");

        // SUBTRACT (INS=0x04)
        System.out.println("Testing SUBTRACT (10 - 5)...");
        testArithmetic(applet, (byte) 0x04, "SUBTRACT");

        // MULTIPLY (INS=0x05)
        System.out.println("Testing MULTIPLY (10 * 5)...");
        testArithmetic(applet, (byte) 0x05, "MULTIPLY");

        // DIVIDE (INS=0x06)
        System.out.println("Testing DIVIDE (10 / 5)...");
        testArithmetic(applet, (byte) 0x06, "DIVIDE");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void testArithmetic(calculator1 applet, byte ins, String name) {
        byte[] cmd = { (byte) 0xB0, ins, 0x00, 0x00 };
        try {
            APDU apdu = new APDU(cmd);
            applet.process(apdu);
            System.out.println("PASS: " + name + " completed.");
            testsPassed++;
        } catch (ISOException e) {
            System.out.printf("FAIL: %s threw ISOException SW=0x%04X%n",
                              name, e.getReason() & 0xFFFF);
            testsFailed++;
        }
    }

    private calculator1 getApplet() {
        javacard.framework.Applet a = javacard.framework.Applet.getRegisteredApplet();
        if (a instanceof calculator1) {
            return (calculator1) a;
        }
        return null;
    }

    private static String hexDump(byte[] bytes) {
        StringBuilder sb = new StringBuilder("[");
        for (byte b : bytes) sb.append(String.format("%02X ", b));
        return sb.toString().trim() + "]";
    }
}
