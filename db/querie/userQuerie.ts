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

export async function oauthUser(username: string, email: string, provider: string, providerId: string) {

    const query = `
                INSERT INTO users (username, email, provider_id, provider)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email, created_at`;
    const values = [username, email, providerId, provider];
    const result = await pool.query(query, values);
    return result.rows[0];
    
}

export async function updateOauthUser(email: string, username: string,  providerId: string, provider: string) {

    const query = `
            UPDATE users
            SET provider_id = $1, provider = $2, username = $4
            WHERE email = $3
            RETURNING id, username, email, provider, provider_id`;
    const values = [providerId, provider, email, username];
    const result = await pool.query(query, values);
    return result.rows[0];

}

export async function getUserByEmail(email: string) {
    console.log("email" + email)
    const result = await pool.query(
        `SELECT id, email, username, password FROM users WHERE email = $1`,
        [email]
    );
    // console.log("result" + result)

    return result.rows[0];
}


const getPasswordByEmail = (email: string) => {

    return `SELECT password FROM user WHERE email = '${email}';`


}