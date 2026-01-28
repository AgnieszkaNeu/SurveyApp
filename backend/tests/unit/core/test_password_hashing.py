from app.core.password_hashing import hash_password, verify_password

def test_hash_and_verify_password():
    password = "SecureP@ssw0rd!"
    hashed = hash_password(password)    

    assert verify_password(password, hashed) == True
    assert verify_password("WrongPassword", hashed) == False