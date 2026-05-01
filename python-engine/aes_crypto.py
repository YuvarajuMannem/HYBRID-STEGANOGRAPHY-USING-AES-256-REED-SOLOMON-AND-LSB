import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

class CryptoModule:
    @staticmethod
    def encrypt_aes(data, password):
        # 1. Convert the password into a secure 32-byte (256-bit) key using SHA-256 hashing
        key = hashlib.sha256(password.encode()).digest()
        
        # 2. Create a new AES cipher object in CBC (Cipher Block Chaining) mode for high security
        cipher = AES.new(key, AES.MODE_CBC)
        
        # 3. Pad the data to ensure its length is a multiple of the AES block size (16 bytes), then encrypt
        ct_bytes = cipher.encrypt(pad(data, AES.block_size))
        
        # 4. Return the Initialization Vector (IV) appended with the ciphertext so it can be decrypted later
        return cipher.iv + ct_bytes
    
    @staticmethod
    def decrypt_aes(encrypted_data, password):
        # 1. Recreate the exact same 32-byte key from the password
        key = hashlib.sha256(password.encode()).digest()
        
        # 2. Extract the 16-byte Initialization Vector (IV) from the beginning of the data
        iv = encrypted_data[:16]
        ct = encrypted_data[16:]
        
        # 3. Rebuild the cipher using the key and the extracted IV
        cipher = AES.new(key, AES.MODE_CBC, iv)
        
        # 4. Decrypt the ciphertext and remove the PKCS7 padding to get the original data back
        return unpad(cipher.decrypt(ct), AES.block_size)
