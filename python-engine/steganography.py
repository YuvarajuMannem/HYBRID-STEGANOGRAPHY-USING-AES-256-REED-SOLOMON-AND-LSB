import sys
import json
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

from aes_crypto import CryptoModule
from reed_solomon_error_correction import ErrorCorrectionModule
from lsb_embedding import EmbeddingModule

class SteganographyEngine:
    def __init__(self):
        self.crypto = CryptoModule()
        self.ec = ErrorCorrectionModule(16)
        self.embedder = EmbeddingModule()

    def calculate_metrics(self, cover_path, stego_path):
        cover = cv2.imread(cover_path)
        stego = cv2.imread(stego_path)
        
        mse = np.mean((cover - stego) ** 2)
        if mse == 0:
            psnr = 100.0
        else:
            psnr = 20 * np.log10(255.0 / np.sqrt(mse))
            
        s = ssim(cover, stego, multichannel=True, channel_axis=2)
        return {"mse": round(float(mse), 4), "psnr": round(float(psnr), 2), "ssim": round(float(s), 4)}

    def embed(self, image_path, secret_data, password, output_path):
        # Step 1: AES Encrypt - Encrypts the raw text into unreadable ciphertext
        encrypted = self.crypto.encrypt_aes(secret_data.encode(), password)
        
        # Step 2: Reed-Solomon Encode - Adds parity bytes to the ciphertext to protect against corruption
        encoded = self.ec.encode(encrypted)
        
        # Step 3: PRNG Spatial Embed - Randomly scatters the protected data into the image using the password as a seed
        self.embedder.embed_data(image_path, encoded, password, output_path)
        
        # Step 4: Calculate Quality Metrics - Mathematically proves the image wasn't visually destroyed
        metrics = self.calculate_metrics(image_path, output_path)
        return metrics

    def extract(self, stego_path, password):
        # Step 1: PRNG Spatial Extract - Uses the password seed to find where the bits are scattered and extracts them
        encoded_data = self.embedder.extract_data(stego_path, password)
        
        # Step 2: Reed-Solomon Decode - Fixes any broken bits/bytes that might have corrupted the payload
        encrypted = self.ec.decode(encoded_data)
        
        # Step 3: AES Decrypt - Turns the ciphertext back into the original text
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
        metrics = engine.embed(image_path, secret, password, output_path)
        print(json.dumps({"success": True, "output": output_path, "metrics": metrics}))
    
    elif action == 'extract':
        stego_path = sys.argv[2]
        password = sys.argv[3]
        
        engine = SteganographyEngine()
        secret = engine.extract(stego_path, password)
        print(json.dumps({"success": True, "secret": secret}))
