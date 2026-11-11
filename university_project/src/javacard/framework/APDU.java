package javacard.framework;

/**
 * APDU (Application Protocol Data Unit) is the communication format used between
 * a card reader and a Java Card applet.
 *
 * An APDU consists of:
 *  - Command APDU: CLA | INS | P1 | P2 | [Lc | Data] | [Le]
 *  - Response APDU: [Data] | SW1 | SW2
 */
public class APDU {

    private byte[] buffer;
    private short outgoingLength;
    private boolean outgoing = false;

    /**
     * Constructs a new APDU object with the given command bytes.
     * @param apduBytes the raw APDU command bytes
     */
    public APDU(byte[] apduBytes) {
        this.buffer = apduBytes.clone();
    }

    /**
     * Returns the APDU buffer byte array.
     * The buffer holds the APDU command data.
     * @return reference to the APDU buffer
     */
    public byte[] getBuffer() {
        return buffer;
    }

    /**
     * Sets output length and switches APDU to outgoing mode.
     * Returns the maximum outgoing length (Le).
     * @return maximum number of bytes that can be sent
     */
    public short setOutgoing() {
        outgoing = true;
        // Return Le field from buffer if present
        return (short) 256;
    }

    /**
     * Sets the length of the response data to be sent.
     * @param len the number of bytes to send
     */
    public void setOutgoingLength(short len) {
        this.outgoingLength = len;
    }

    /**
     * Sends response bytes from the internal buffer, starting at offset bOff.
     * @param bOff   offset into buffer to start sending from
     * @param len    length of bytes to send
     */
    public void sendBytes(short bOff, short len) {
        System.out.println("[APDU Response] Sending " + len + " bytes starting at offset " + bOff + ":");
        System.out.print("  Data: ");
        for (int i = bOff; i < bOff + len && i < buffer.length; i++) {
            System.out.printf("%02X ", buffer[i]);
        }
        System.out.println();
    }

    /**
     * Sends response bytes from a specified byte array, starting at offset.
     * @param outData  the byte array containing response data
     * @param bOff     offset into outData
     * @param len      length of bytes to send
     */
    public void sendBytesLong(byte[] outData, short bOff, short len) {
        System.out.println("[APDU Response] Sending " + len + " bytes:");
        System.out.print("  Data: ");
        for (int i = bOff; i < bOff + len && i < outData.length; i++) {
            System.out.printf("%02X ", outData[i]);
        }
        System.out.println();
    }

    /**
     * Returns the incoming data length (Lc field).
     * @return the number of incoming data bytes
     */
    public short getIncomingLength() {
        if (buffer.length > ISO7816.OFFSET_LC) {
            return (short)(buffer[ISO7816.OFFSET_LC] & 0xFF);
        }
        return 0;
    }

    /**
     * Receives incoming data into the APDU buffer.
     * @return the byte count received
     */
    public short receiveBytes(short bOff) {
        return getIncomingLength();
    }

    /**
     * Sets the outgoing and sends the bytes.
     * Convenience for response without Le check.
     */
    public short setOutgoingAndSend(short bOff, short len) {
        setOutgoing();
        setOutgoingLength(len);
        sendBytes(bOff, len);
        return len;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("APDU[");
        for (byte b : buffer) {
            sb.append(String.format("%02X ", b));
        }
        sb.append("]");
        return sb.toString();
    }
}
