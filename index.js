const express = require( 'express' );
const sqlite = require( 'sqlite' );
const sqlite3 = require( 'sqlite3' );

const path = require( 'path' );
const bodyParser = require( 'body-parser' );

const dbConnection = sqlite.open( { filename: 'banco.sqlite', driver: sqlite3.Database }, { Promise } )

const app = express();

app.set( 'view engine', 'ejs' );
app.set( 'views',  path.join( __dirname, 'views' ) );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.get( '/', async( req, res ) => {

    const db = await dbConnection;

    const vagas = await db.all( 'SELECT * FROM vagas' );
    const categoriasDB = await db.all( 'SELECT * FROM categorias' );

    const categorias = categoriasDB.map( categoria => {

        return {

            ...categoria,
            vagas: vagas.filter( vaga => vaga.categoria == categoria.id )

        };

    } )
    
    res.render( 'index', { categorias } );

} );

app.get( '/vaga/:id', async( req, res ) => {

    const db = await dbConnection;
    
    const vaga = await db.get( 'SELECT * FROM vagas WHERE id=' + req.params.id );

    res.render( 'vaga', { vaga: vaga } );

} );

app.get( '/admin', async( req, res ) => {

    res.render( 'admin/index' );

} );


app.get( '/admin/categorias', async( req, res ) => {

    const db = await dbConnection;
    
    const categorias = await db.all( 'SELECT * FROM categorias');

    res.render( 'admin/categorias/index', { categorias } );

} );

app.get( '/admin/categorias/nova', async( req, res ) => {

    const db = await dbConnection;

    res.render( 'admin/categorias/nova-categoria' );

} );

app.post( '/admin/categorias/nova', async( req, res ) => {

    const db = await dbConnection;

    const { category } = req.body;

    await db.run( `INSERT INTO categorias( categoria ) VALUES( '${category}' )` );

    res.redirect( '/admin/categorias' );

} );


app.get( '/admin/categorias/edit/:id', async( req, res ) => {

    const db = await dbConnection;
    
    const categoria = await db.get( 'SELECT * FROM categorias WHERE id=' + req.params.id );    

    res.render( 'admin/categorias/edit-categoria', { categoria } );

} );

app.post( '/admin/categorias/edit/:id', async( req, res ) => {

    const db = await dbConnection;

    const id = req.params.id;
    const { category } = req.body;
    
    await db.run( `UPDATE categorias SET categoria = '${category}' WHERE id = ${id}` );
    
    res.redirect( '/admin/categorias' );

} );

app.get( '/admin/categorias/delete/:id', async( req, res ) => {

    const db = await dbConnection;
    
    await db.run( 'DELETE FROM categorias WHERE id=' + req.params.id );

    res.redirect( '/admin/categorias' );

} );

app.get( '/admin/vagas', async( req, res ) => {

    const db = await dbConnection;
    
    const vagas = await db.all( 'SELECT * FROM vagas');

    res.render( 'admin/vagas/index', { vagas } );

} );

app.get( '/admin/vagas/delete/:id', async( req, res ) => {

    const db = await dbConnection;
    
    await db.run( 'DELETE FROM vagas WHERE id=' + req.params.id );

    res.redirect( '/admin/vagas' );

} );

app.get( '/admin/vagas/nova', async( req, res ) => {

    const db = await dbConnection;
    
    const categorias = await db.all( 'SELECT * FROM categorias' );

    res.render( 'admin/vagas/nova-vaga', { categorias } );

} );

app.post( '/admin/vagas/nova', async( req, res ) => {

    const db = await dbConnection;

    const { category, title, description } = req.body;

    await db.run( `INSERT INTO vagas( categoria, title, description ) VALUES( ${category}, '${title}', '${description}' )` );

    res.redirect( '/admin/vagas' );

} );

app.get( '/admin/vagas/edit/:id', async( req, res ) => {

    const db = await dbConnection;
    
    const vaga = await db.get( 'SELECT * FROM vagas WHERE id=' + req.params.id );    
    const categorias = await db.all( 'SELECT * FROM categorias' );

    res.render( 'admin/vagas/edit-vaga', { vaga, categorias } );

} );

app.post( '/admin/vagas/edit/:id', async( req, res ) => {

    const db = await dbConnection;

    const id = req.params.id;
    const { category, title, description } = req.body;
    
    await db.run( `UPDATE vagas SET categoria = ${category}, title = '${title}', description = '${description}' WHERE id = ${id}` );
    
    res.redirect( '/admin/vagas' );

} );


// const init = async() => {

//     const db = await dbConnection;

//     await db.run( 'CREATE TABLE IF NOT EXISTS categorias ( id INTEGER PRIMARY KEY, categoria TEXT );' );
//     await db.run( 'CREATE TABLE IF NOT EXISTS vagas ( id INTEGER PRIMARY KEY, categoria INTEGER, title TEXT, description TEXT );' );
//     const vaga = 'Social Media (San Francisco)';
//     const description = 'Vaga para Mídia Social';
//     await db.run( `INSERT INTO vagas( categoria, title, description ) VALUES( 2, '${vaga}', '${description}' )` );

//     const categoria = 'Marketing team';
//     await db.run( `INSERT INTO categorias( categoria ) VALUES( '${categoria}' )` );

// };

//init();

app.listen( 3000, err => {

    if ( err ) {

        console.log( err );

    }
    else {

        console.log( 'Server running on port ', 3000 );

    }

} );