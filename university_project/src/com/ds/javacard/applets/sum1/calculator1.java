package com.ds.javacard.applets.sum1;

import javacard.framework.APDU;
import javacard.framework.Applet;
import javacard.framework.ISO7816;
import javacard.framework.ISOException;
import javacard.framework.Util;

/**
 * Calculator1 - A JavaCard Applet that performs basic arithmetic and data operations.
 *
 * This applet processes APDU commands to:
 *  - Write data (INS = 0x01)
 *  - Read data  (INS = 0x02)
 *  - Add numbers (INS = 0x03)
 *  - Subtract   (INS = 0x04)
 *  - Multiply   (INS = 0x05)
 *  - Divide     (INS = 0x06)
 *
 * APDU Format:
 *   CLA: 0xB0
 *   INS: command instruction byte
 *   P1:  parameter 1
 *   P2:  parameter 2
 *   Lc:  length of data (for write, must be 0x04)
 *   Data: input bytes
 */
public class calculator1 extends Applet {

    // Custom CLA byte for this applet
    private static final byte CLA_CALC = (byte) 0xB0;

    // Instruction codes
    private static final byte INS_WRITE_DATA = (byte) 0x01;
    private static final byte INS_READ_DATA  = (byte) 0x02;
    private static final byte INS_ADD        = (byte) 0x03;
    private static final byte INS_SUBTRACT   = (byte) 0x04;
    private static final byte INS_MULTIPLY   = (byte) 0x05;
    private static final byte INS_DIVIDE     = (byte) 0x06;

    // Internal data store — 4 bytes for two short operands
    private byte[] array;
    private short  inputLength;

    /**
     * Private constructor — applet is instantiated via install().
     */
    private calculator1() {
        array       = new byte[4];
        inputLength = 4;
    }

    /**
     * Entry point called by the Java Card runtime during applet installation.
     *
     * @param bArray  the byte array containing the installation parameters
     * @param bOffset offset into bArray where parameters start
     * @param bLength length of the parameter data
     */
    public static void install(byte[] bArray, short bOffset, byte bLength) {
        new calculator1().register(bArray, bOffset, bLength);
    }

    /**
     * Processes an incoming APDU command.
     * Dispatches based on the INS byte to the appropriate handler.
     *
     * @param o_apdu the incoming APDU object
     * @throws ISOException if the command is not recognized or data is invalid
     */
    @Override
    public void process(APDU o_apdu) throws ISOException {
        byte[] ba_buffer = o_apdu.getBuffer();

        // Ignore the SELECT command (handled by runtime)
        if (selectingApplet(o_apdu)) {
            return;
        }

        // Validate CLA byte
        if (ba_buffer[ISO7816.OFFSET_CLA] != CLA_CALC) {
            ISOException.throwIt(ISO7816.SW_CLA_NOT_SUPPORTED);
        }

        // Dispatch to appropriate handler based on INS
        switch (ba_buffer[ISO7816.OFFSET_INS]) {
            case INS_WRITE_DATA:
                write_data(o_apdu, ba_buffer);
                break;
            case INS_READ_DATA:
                read_data(o_apdu, ba_buffer);
                break;
            case INS_ADD:
                arithmetic(o_apdu, ba_buffer, INS_ADD);
                break;
            case INS_SUBTRACT:
                arithmetic(o_apdu, ba_buffer, INS_SUBTRACT);
                break;
            case INS_MULTIPLY:
                arithmetic(o_apdu, ba_buffer, INS_MULTIPLY);
                break;
            case INS_DIVIDE:
                arithmetic(o_apdu, ba_buffer, INS_DIVIDE);
                break;
            default:
                ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
        }
    }

    /**
     * Handles the WRITE_DATA command.
     * Validates P1/P2 parameters, checks Lc == 0x04, then copies data into internal array.
     *
     * @param o_apdu    the APDU object
     * @param ba_buffer the APDU buffer
     * @throws ISOException SW_INCORRECT_P1P2 if P1 != 0x00 or P2 != 0x00
     * @throws ISOException SW_WRONG_LENGTH   if Lc != 0x04
     */
    public void write_data(APDU o_apdu, byte[] ba_buffer) {
        // Validate P1 and P2
        if (ba_buffer[ISO7816.OFFSET_P1] == 0x00
                && ba_buffer[ISO7816.OFFSET_P2] == 0x00) {
            // Check that Lc (length of incoming data) is exactly 4 bytes
            if (0x04 != ba_buffer[ISO7816.OFFSET_LC]) {
                ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
            }
            // Copy 4 data bytes from APDU buffer into internal array
            Util.arrayCopyNonAtomic(ba_buffer, ISO7816.OFFSET_CDATA,
                                    array, (short) 0, (short) 4);
            System.out.println("[write_data] Stored: "
                + String.format("%02X %02X %02X %02X",
                    array[0], array[1], array[2], array[3]));
        } else {
            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
        }
    }

    /**
     * Handles the READ_DATA command.
     * Validates that Le is sufficient, then sends back the stored 4 bytes.
     *
     * @param o_apdu    the APDU object
     * @param ba_buffer the APDU buffer
     * @throws ISOException SW_WRONG_LENGTH if Le < inputLength
     */
    public void read_data(APDU o_apdu, byte[] ba_buffer) {
        short le = o_apdu.setOutgoing();
        if (le < inputLength) {
            ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
        }
        // Copy stored data into APDU buffer for response (data starts at index 0)
        Util.arrayCopyNonAtomic(array, (short) 0, ba_buffer, (short) 0,
                                (short) inputLength);
        o_apdu.setOutgoingLength(inputLength);
        o_apdu.sendBytes((short) 0, inputLength);
    }

    /**
     * Handles arithmetic operations: ADD, SUBTRACT, MULTIPLY, DIVIDE.
     * Reads two shorts from the internal array and returns the result.
     *
     * @param o_apdu    the APDU object
     * @param ba_buffer the APDU buffer
     * @param operation the arithmetic instruction code
     */
    private void arithmetic(APDU o_apdu, byte[] ba_buffer, byte operation) {
        // Reconstruct two shorts from the stored 4 bytes
        short operand1 = Util.makeShort(array[0], array[1]);
        short operand2 = Util.makeShort(array[2], array[3]);
        short result;

        System.out.printf("[arithmetic] operand1=%d, operand2=%d%n",
                          operand1, operand2);

        switch (operation) {
            case INS_ADD:
                result = (short)(operand1 + operand2);
                System.out.println("[arithmetic] " + operand1 + " + " + operand2
                                   + " = " + result);
                break;
            case INS_SUBTRACT:
                result = (short)(operand1 - operand2);
                System.out.println("[arithmetic] " + operand1 + " - " + operand2
                                   + " = " + result);
                break;
            case INS_MULTIPLY:
                result = (short)(operand1 * operand2);
                System.out.println("[arithmetic] " + operand1 + " * " + operand2
                                   + " = " + result);
                break;
            case INS_DIVIDE:
                if (operand2 == 0) {
                    ISOException.throwIt(ISO7816.SW_WRONG_DATA);
                }
                result = (short)(operand1 / operand2);
                System.out.println("[arithmetic] " + operand1 + " / " + operand2
                                   + " = " + result);
                break;
            default:
                ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
                return;
        }

        // Send result back in the response
        short le = o_apdu.setOutgoing();
        Util.setShort(ba_buffer, (short) 0, result);
        o_apdu.setOutgoingLength((short) 2);
        o_apdu.sendBytes((short) 0, (short) 2);
    }

    @Override
    public String toString() {
        return "Calculator1 Applet [array="
               + String.format("%02X %02X %02X %02X",
                   array[0], array[1], array[2], array[3])
               + "]";
    }
}
