from PIL import Image
import numpy as np

class EmbeddingModule:
    @staticmethod
    def text_to_bits(text):
        return ''.join(format(byte, '08b') for byte in text)
    
    @staticmethod
    def bits_to_text(bits):
        return bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))

    @staticmethod
    def embed_data(image_path, encoded_data, output_path):
        bits = EmbeddingModule.text_to_bits(encoded_data)
        data_length = len(bits)
        
        img = Image.open(image_path)
        pixels = np.array(img)
        max_capacity = pixels.size * 3
        
        if data_length + 32 > max_capacity:
            raise ValueError("Image too small for data")
            
        length_bits = format(data_length, '032b')
        bits = length_bits + bits
        
        flat_pixels = pixels.flatten()
        for i in range(len(bits)):
            flat_pixels[i] = (flat_pixels[i] & 254) | int(bits[i])
            
        stego_pixels = flat_pixels.reshape(pixels.shape)
        stego_img = Image.fromarray(stego_pixels)
        stego_img.save(output_path, 'PNG')

    @staticmethod
    def extract_data(stego_path):
        img = Image.open(stego_path)
        pixels = np.array(img)
        flat_pixels = pixels.flatten()
        
        length_bits = ''
        for i in range(32):
            length_bits += str(flat_pixels[i] & 1)
        data_length = int(length_bits, 2)
        
        bits = ''
        for i in range(32, 32 + data_length):
            bits += str(flat_pixels[i] & 1)
            
        return EmbeddingModule.bits_to_text(bits)
