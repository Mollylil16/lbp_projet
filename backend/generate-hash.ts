import * as bcrypt from 'bcrypt';

// Script pour générer un hash bcrypt pour le mot de passe "test123"
async function generateHash() {
    const password = 'test123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('');
    console.log('SQL pour créer un utilisateur de test:');
    console.log(`UPDATE lbp_users SET password = '${hash}' WHERE username = 'admin';`);
}

generateHash();
