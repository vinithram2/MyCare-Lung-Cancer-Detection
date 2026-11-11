package javacard.framework;

/**
 * ISOException class encapsulates an ISO 7816-4 response status word as its reason code.
 * This exception is thrown when an error occurs during APDU processing.
 */
public class ISOException extends CardRuntimeException {

    private static ISOException systemInstance = new ISOException((short) 0);

    /**
     * Constructs an ISOException with the specified reason code.
     * @param sw the ISO 7816-4 defined status word
     */
    public ISOException(short sw) {
        super(sw);
    }

    /**
     * Throws the system singleton ISOException with the specified reason code.
     * To conserve on memory, use this method to throw the exception object
     * instead of creating a new instance each time.
     *
     * @param sw the ISO 7816-4 defined status word
     * @throws ISOException always
     */
    public static void throwIt(short sw) throws ISOException {
        systemInstance.setReason(sw);
        throw systemInstance;
    }
}
