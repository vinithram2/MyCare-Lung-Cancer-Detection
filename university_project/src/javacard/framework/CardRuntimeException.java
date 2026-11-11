package javacard.framework;

/**
 * CardRuntimeException is the base class for unchecked exceptions in the JavaCard framework.
 */
public class CardRuntimeException extends RuntimeException {

    private short reason;

    /**
     * Constructs a CardRuntimeException with the given reason code.
     * @param reason the reason for the exception
     */
    protected CardRuntimeException(short reason) {
        super("CardRuntimeException: reason=0x" + Integer.toHexString(reason & 0xFFFF));
        this.reason = reason;
    }

    /**
     * Returns the reason code for this exception.
     * @return the reason code
     */
    public short getReason() {
        return reason;
    }

    /**
     * Sets the reason code for this exception.
     * @param reason the reason code to set
     */
    public void setReason(short reason) {
        this.reason = reason;
    }
}
