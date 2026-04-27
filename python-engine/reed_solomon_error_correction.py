from reedsolo import RSCodec

class ErrorCorrectionModule:
    def __init__(self, ec_bytes=16):
        self.rs = RSCodec(ec_bytes)
        
    def encode(self, data):
        return self.rs.encode(data)
        
    def decode(self, encoded_data):
        try:
            return self.rs.decode(encoded_data)[0]
        except Exception as e:
            raise ValueError("Data corrupted beyond repair") from e
