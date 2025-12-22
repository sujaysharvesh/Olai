import pool from "../postgres";


export async function registerUserQuery(
    username: string,
    email: string,
    password: string
) {
    const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
    `;

    const values = [username, email, password];
    const result = await pool.query(query, values);

    return result.rows[0];
}

export async function getUserByEmail(email: string) {
    const result = await pool.query(
        `SELECT id, email, username, password FROM users WHERE email = $1`,
        [email]
    );

    return result.rows[0];
}


const getPasswordByEmail = (email: string) => {

    return `SELECT password FROM user WHERE email = '${email}';`


}