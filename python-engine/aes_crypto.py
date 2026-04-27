import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

class CryptoModule:
    @staticmethod
    def encrypt_aes(data, password):
        key = hashlib.sha256(password.encode()).digest()
        cipher = AES.new(key, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(data, AES.block_size))
        return cipher.iv + ct_bytes
    
    @staticmethod
    def decrypt_aes(encrypted_data, password):
        key = hashlib.sha256(password.encode()).digest()
        iv = encrypted_data[:16]
        ct = encrypted_data[16:]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), AES.block_size)
