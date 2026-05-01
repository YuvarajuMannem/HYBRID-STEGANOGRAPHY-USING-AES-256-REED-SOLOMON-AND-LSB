from PIL import Image
import numpy as np

import hashlib

class EmbeddingModule:
    @staticmethod
    def text_to_bits(text):
        return ''.join(format(byte, '08b') for byte in text)
    
    @staticmethod
    def bits_to_text(bits):
        return bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))

    @staticmethod
    def get_shuffled_indices(max_size, password):
        # 1. Generate a deterministic seed from the AES password. 
        # This ensures the exact same random scatter pattern is generated during extraction.
        seed = int(hashlib.sha256(password.encode()).hexdigest(), 16) % (2**32 - 1)
        
        # 2. Create a Pseudo-Random Number Generator (PRNG) with this seed
        rng = np.random.RandomState(seed)
        
        # 3. Create an array of all pixel indices and shuffle them randomly
        indices = np.arange(max_size)
        rng.shuffle(indices)
        return indices

    @staticmethod
    def embed_data(image_path, encoded_data, password, output_path):
        # Convert the secret data into a binary string
        bits = EmbeddingModule.text_to_bits(encoded_data)
        data_length = len(bits)
        
        # Open the image and convert it into a 1D array of flat pixel values
        img = Image.open(image_path).convert('RGB')
        pixels = np.array(img)
        max_capacity = pixels.size
        
        if data_length + 32 > max_capacity:
            raise ValueError("Image too small for data")
            
        # Prepend a 32-bit header that tells the extractor exactly how many bits to read
        length_bits = format(data_length, '032b')
        bits = length_bits + bits
        
        flat_pixels = pixels.flatten()
        
        # Get the cryptographic scatter pattern (shuffled indices)
        indices = EmbeddingModule.get_shuffled_indices(max_capacity, password)
        
        # Embed each bit into the Least Significant Bit (LSB) of the randomly chosen pixels
        for i in range(len(bits)):
            idx = indices[i]
            # (value & 254) clears the last bit. '| int(bits[i])' sets the last bit to our secret bit.
            flat_pixels[idx] = (flat_pixels[idx] & 254) | int(bits[i])
            
        stego_pixels = flat_pixels.reshape(pixels.shape)
        stego_img = Image.fromarray(stego_pixels)
        stego_img.save(output_path, 'PNG')

    @staticmethod
    def extract_data(stego_path, password):
        img = Image.open(stego_path).convert('RGB')
        pixels = np.array(img)
        flat_pixels = pixels.flatten()
        max_capacity = pixels.size
        
        indices = EmbeddingModule.get_shuffled_indices(max_capacity, password)
        
        length_bits = ''
        for i in range(32):
            idx = indices[i]
            length_bits += str(flat_pixels[idx] & 1)
        data_length = int(length_bits, 2)
        
        # Sanity check to prevent massive memory allocation on wrong password
        if data_length > max_capacity or data_length < 0:
            raise ValueError("Invalid password or corrupted image (Length decoded is out of bounds).")
            
        bits = ''
        for i in range(32, 32 + data_length):
            idx = indices[i]
            bits += str(flat_pixels[idx] & 1)
            
        return EmbeddingModule.bits_to_text(bits)
