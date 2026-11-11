package javacard.framework;

/**
 * Util class provides common utility functions for JavaCard applets.
 * These are optimized low-level byte array operations.
 */
public class Util {

    /**
     * Copies an array from src to dest without atomic transaction protection.
     * Equivalent to System.arraycopy but returns the destination offset after copy.
     *
     * @param src       source byte array
     * @param srcOff    offset into source array
     * @param dest      destination byte array
     * @param destOff   offset into destination array
     * @param length    number of bytes to copy
     * @return          destOff + length (the offset just past the last copied byte)
     */
    public static short arrayCopyNonAtomic(byte[] src, short srcOff,
                                            byte[] dest, short destOff,
                                            short length) {
        System.arraycopy(src, srcOff, dest, destOff, length);
        return (short)(destOff + length);
    }

    /**
     * Fills a range of bytes in a byte array with the given byte value, non-atomically.
     *
     * @param bArray    the byte array to fill
     * @param bOff      starting offset
     * @param bLen      number of bytes to fill
     * @param bValue    the byte value to fill with
     * @return          bOff + bLen
     */
    public static short arrayFillNonAtomic(byte[] bArray, short bOff,
                                            short bLen, byte bValue) {
        for (short i = 0; i < bLen; i++) {
            bArray[(short)(bOff + i)] = bValue;
        }
        return (short)(bOff + bLen);
    }

    /**
     * Compares two byte arrays lexicographically.
     *
     * @param src       first byte array
     * @param srcOff    offset into first array
     * @param dest      second byte array
     * @param destOff   offset into second array
     * @param length    number of bytes to compare
     * @return          0 if equal, negative if src < dest, positive if src > dest
     */
    public static byte arrayCompare(byte[] src, short srcOff,
                                     byte[] dest, short destOff,
                                     short length) {
        for (short i = 0; i < length; i++) {
            int a = src[srcOff + i] & 0xFF;
            int b = dest[destOff + i] & 0xFF;
            if (a != b) {
                return (byte)(a - b < 0 ? -1 : 1);
            }
        }
        return 0;
    }

    /**
     * Concatenates two bytes to form a short value.
     *
     * @param b1 the high-order byte
     * @param b2 the low-order byte
     * @return   the combined short value
     */
    public static short makeShort(byte b1, byte b2) {
        return (short)(((b1 & 0xFF) << 8) | (b2 & 0xFF));
    }

    /**
     * Returns the high byte of a short value.
     *
     * @param s the short value
     * @return  the high-order byte
     */
    public static byte getShort(byte[] bArray, short bOff) {
        return (byte)(makeShort(bArray[bOff], bArray[(short)(bOff + 1)]));
    }

    /**
     * Sets two bytes in an array representing a short value.
     *
     * @param bArray the byte array
     * @param bOff   offset to start writing at
     * @param sValue the short value to write
     * @return       bOff + 2
     */
    public static short setShort(byte[] bArray, short bOff, short sValue) {
        bArray[bOff]             = (byte)((sValue >> 8) & 0xFF);
        bArray[(short)(bOff+1)]  = (byte)(sValue & 0xFF);
        return (short)(bOff + 2);
    }
}
