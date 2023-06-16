import express, {Application, Router} from "express";
import bodyParser from 'body-parser';
import pool from './db/DBConnector';
import {getCategories, getClothesByCategory} from "./db/DBUtility";
import path from "path";

class Server {
    private app;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        this.dbConnect();
    }

    private config() {
        this.app.set('view engine', 'ejs');

        this.app.use(bodyParser.urlencoded({ extended:true }));
        this.app.use(bodyParser.json({ limit: '1mb' })); // 100kb default
    }

    private dbConnect() {
        pool.connect((err, client, done) => {
            if (err) throw err;
            console.log('Connected');
        });

    }

    private routerConfig() {
        this.app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
        this.app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
        this.app.get('/:category', (req, res) => {
            getCategories().then((categories) => {
                if (categories.includes(req.params.category)) {
                    getClothesByCategory(req.params.category).then((clothing) => {
                        res.render(path.join(__dirname, 'public', 'index'), {
                            categories: categories,
                            clothing: clothing
                        });
                    }).catch(() => {
                        res.sendStatus(500);
                    })
                }
            }).catch(() => {
                res.sendStatus(500);
            });
        });
        this.app.get('/', (req, res) => {
            Promise.all([getCategories()])
                .then((data) => {
                    res.render(path.join(__dirname, 'public', 'index'), {
                        categories: data[0]
                    });
                })
                .catch(() => {
                    res.sendStatus(500);
                });
        });

    }

    public async checkDbConfiguration() {
        const client = await pool.connect();
        console.log('Check Table configuration.');
        const createTablesSql = `
            BEGIN;
            CREATE TABLE IF NOT EXISTS Clothing (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                image BYTEA UNIQUE NOT NULL,
                laundry BOOLEAN NOT NULL,
                favourite BOOLEAN NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Category (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                name VARCHAR UNIQUE NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Subcategory (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                name VARCHAR UNIQUE NOT NULL,
                category INTEGER,
                CONSTRAINT fk_category
                  FOREIGN KEY(category)
                    REFERENCES Category(id)
                    ON DELETE NO ACTION
            );
            CREATE TABLE IF NOT EXISTS Pattern (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                image BYTEA UNIQUE NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Material (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                name VARCHAR UNIQUE NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Season (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                name VARCHAR UNIQUE NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Colour (
                id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                red INTEGER NOT NULL CHECK (0 <= red AND red <= 255),
                green INTEGER NOT NULL CHECK (0 <= green AND green <= 255),
                blue INTEGER NOT NULL CHECK (0 <= blue AND blue <= 255),
                alpha INTEGER NOT NULL CHECK (0 <= alpha AND alpha <= 255),
                gradient_red INTEGER CHECK (0 <= red AND red <= 255),
                gradient_green INTEGER CHECK (0 <= green AND green <= 255),
                gradient_blue INTEGER CHECK (0 <= blue AND blue <= 255),
                gradient_alpha INTEGER CHECK (0 <= alpha AND alpha <= 255)
            );
            
            CREATE TABLE IF NOT EXISTS Clothing_Subcategory (
                clothing INTEGER,
                subcategory INTEGER,
                PRIMARY KEY (clothing, subcategory),
                CONSTRAINT fk_clothing
                  FOREIGN KEY(clothing)
                    REFERENCES Clothing(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_subcategory
                  FOREIGN KEY(subcategory)
                    REFERENCES Subcategory(id)
                    ON DELETE NO ACTION
            );
            CREATE TABLE IF NOT EXISTS Clothing_Pattern (
                clothing INTEGER,
                pattern INTEGER,
                PRIMARY KEY (clothing, pattern),
                CONSTRAINT fk_clothing
                  FOREIGN KEY(clothing)
                    REFERENCES Clothing(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_pattern
                  FOREIGN KEY(pattern)
                    REFERENCES Pattern(id)
                    ON DELETE NO ACTION
            );
            CREATE TABLE IF NOT EXISTS Clothing_Material (
                clothing INTEGER,
                material INTEGER,
                PRIMARY KEY (clothing, material),
                CONSTRAINT fk_clothing
                  FOREIGN KEY(clothing)
                    REFERENCES Clothing(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_material
                  FOREIGN KEY(material)
                    REFERENCES Material(id)
                    ON DELETE NO ACTION
            );
            CREATE TABLE IF NOT EXISTS Clothing_Season (
                clothing INTEGER,
                season INTEGER,
                PRIMARY KEY (clothing, season),
                CONSTRAINT fk_clothing
                  FOREIGN KEY(clothing)
                    REFERENCES Clothing(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_season
                  FOREIGN KEY(season)
                    REFERENCES Season(id)
                    ON DELETE NO ACTION
            );
            CREATE TABLE IF NOT EXISTS Clothing_Colour (
                clothing INTEGER,
                colour INTEGER,
                PRIMARY KEY (clothing, colour),
                CONSTRAINT fk_clothing
                  FOREIGN KEY(clothing)
                    REFERENCES Clothing(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_colour
                  FOREIGN KEY(colour)
                    REFERENCES Colour(id)
                    ON DELETE NO ACTION
            );
            COMMIT;
        `;

        await client.query(createTablesSql);

        client.release();

        return this;
    }

    public async start(port: number) {
        this.app.listen(port, () => {
            console.log(`Running on port ${port}`)
        }).on('error', (err) => console.log(err));
    }
}

export default Server;