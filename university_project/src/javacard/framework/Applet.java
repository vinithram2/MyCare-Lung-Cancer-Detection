package javacard.framework;

/**
 * Applet is the base class for all Java Card applets.
 * Every applet must extend this class and implement the process() method.
 */
public abstract class Applet {

    private static Applet registeredApplet = null;

    /**
     * Registers this applet instance with the Java Card runtime environment.
     * Must be called during the applet's install() method.
     */
    protected final void register() {
        registeredApplet = this;
        System.out.println("[Applet] Registered: " + this.getClass().getSimpleName());
    }

    /**
     * Registers this applet instance with an AID.
     * @param bArray   byte array containing the AID
     * @param bOffset  offset into bArray where AID starts
     * @param bLength  length of the AID
     */
    protected final void register(byte[] bArray, short bOffset, byte bLength) {
        registeredApplet = this;
        System.out.print("[Applet] Registered with AID: ");
        for (int i = bOffset; i < bOffset + bLength; i++) {
            System.out.printf("%02X ", bArray[i]);
        }
        System.out.println();
    }

    /**
     * Called when the applet is selected. Override to handle selection logic.
     * @return true if the applet is selectable, false otherwise
     */
    public boolean select() {
        return true;
    }

    /**
     * Called when the applet is deselected.
     */
    public void deselect() {
    }

    /**
     * Must be implemented by the applet to process incoming APDU commands.
     * @param apdu the incoming APDU command
     */
    public abstract void process(APDU apdu) throws ISOException;

    /**
     * Checks whether the current APDU is a SELECT command.
     * @param apdu the incoming APDU
     * @return true if it is a SELECT command (INS == 0xA4 and CLA == 0x00)
     */
    public static boolean selectingApplet(APDU apdu) {
        byte[] buffer = apdu.getBuffer();
        return (buffer[ISO7816.OFFSET_INS] == ISO7816.INS_SELECT
                && buffer[ISO7816.OFFSET_CLA] == ISO7816.CLA_ISO7816);
    }

    /**
     * Returns the registered applet instance (for simulation purposes).
     * @return the registered applet, or null
     */
    public static Applet getRegisteredApplet() {
        return registeredApplet;
    }
}
