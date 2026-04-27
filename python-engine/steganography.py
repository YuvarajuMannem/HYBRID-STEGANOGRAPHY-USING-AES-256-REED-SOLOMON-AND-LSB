import sys
import json
from aes_crypto import CryptoModule
from reed_solomon_error_correction import ErrorCorrectionModule
from lsb_embedding import EmbeddingModule

class SteganographyEngine:
    def __init__(self):
        self.crypto = CryptoModule()
        self.ec = ErrorCorrectionModule(16)
        self.embedder = EmbeddingModule()

    def embed(self, image_path, secret_data, password, output_path):
        # Step 1: AES Encrypt
        encrypted = self.crypto.encrypt_aes(secret_data.encode(), password)
        
        # Step 2: Reed-Solomon Encode
        encoded = self.ec.encode(encrypted)
        
        # Step 3: Embed in Image
        self.embedder.embed_data(image_path, encoded, output_path)
        return True

    def extract(self, stego_path, password):
        # Step 1: Extract data from Image
        encoded_data = self.embedder.extract_data(stego_path)
        
        # Step 2: Reed-Solomon Decode
        encrypted = self.ec.decode(encoded_data)
        
        # Step 3: AES Decrypt
        decrypted = self.crypto.decrypt_aes(encrypted, password)
        
        return decrypted.decode()

if __name__ == '__main__':
    action = sys.argv[1]
    
    if action == 'embed':
        image_path = sys.argv[2]
        secret = sys.argv[3]
        password = sys.argv[4]
        output_path = sys.argv[5]
        
        engine = SteganographyEngine()
        engine.embed(image_path, secret, password, output_path)
        print(json.dumps({"success": True, "output": output_path}))
    
    elif action == 'extract':
        stego_path = sys.argv[2]
        password = sys.argv[3]
        
        engine = SteganographyEngine()
        secret = engine.extract(stego_path, password)
        print(json.dumps({"success": True, "secret": secret}))
