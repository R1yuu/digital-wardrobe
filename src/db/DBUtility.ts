import pool from "./DBConnector";

export async function getCategories(): Promise<string[]> {
    try {
        const client = await pool.connect();

        const sql = "SELECT name FROM Category;";
        const { rows } = await client.query(sql);
        const category_names = rows;

        client.release();

        return category_names;
    } catch (error) {
        if (error instanceof Error) {
            return [error.name, error.message];
        } else {
            return [];
        }
    }
}

export async function getClothesByCategory(category: string): Promise<string[]> {
    try {
        const client = await pool.connect();

        const sql = `
            SELECT Clothing.id, Clothing.image, Clothing.laundry, Clothing.favourite
              FROM Category
              JOIN Subcategory ON Category.id = Subcategory.category
              JOIN Clothing_Subcategory ON Subcategory.id = Clothing_Subcategory.subcategory
              JOIN Clothing ON Clothing_Subcategory.clothing = Clothing.id
             WHERE Category.name = "${category}";
        `;
        const { rows } = await client.query(sql);
        const clothes = rows;

        console.log(clothes);

        client.release();

        return clothes;
    } catch (error) {
        if (error instanceof Error) {
            return [error.name, error.message];
        } else {
            return [];
        }
    }
}