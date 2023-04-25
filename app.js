const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const main_path = path.join(__dirname, "moviesData.db");

//connect_db_server
let movie_db_server = null;
const connect_dbserver = async () => {
  try {
    movie_db_server = await open({
      filename: main_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at 3000 port");
    });
  } catch (e) {
    console.log(`errr ${e.message}`);
    process.exit(1);
  }
};

connect_dbserver();

//Returns a list of all movie names in the movie table
let change_label = (every_mv) => {
  return {
    movieName: every_mv.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  let movie_names_query = `
  SELECT 
  movie_name
  FROM
  movie;
  `;
  const get_all_movies = await movie_db_server.all(movie_names_query);
  response.send(
    get_all_movies.map((every_mv) => {
      return change_label(every_mv);
    })
  );
  //response.send(get_all_movies);
});

//Creates a new movie in the movie table. movie_id is auto-incremented
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  //console.log(directorId);
  let post_movie_query = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');

  `;
  const post_movie_details = await movie_db_server.run(post_movie_query);
  const movie_id = post_movie_details.lastID;
  console.log({ mov_id: movie_id });
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let mov_u_query = `
  SELECT
  *
  FROM
  movie
  WHERE
  movie_id=${movieId};
  `;
  let unq_mov = await movie_db_server.get(mov_u_query);
  response.send(
    unq_mov.map((movie_unq) => {
      return movie_unq;
    })
  );
});

//Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  //console.log(request.body);
  const updating_query = `
  UPDATE
  movie
  SET
  director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE 
  movie_id=${movieId};
  `;

  const updating_det = await movie_db_server.run(updating_query);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //console.log(movieId);
  let delete_query = `
  DELETE FROM
  movie
  WHERE
  movie_id=${movieId};
  `;
  const delete_movie = await movie_db_server.run(delete_query);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table  director
let change_director_key = (dir_key) => {
  return {
    directorId: dir_key.director_id,
    directorName: dir_key.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  let all_directors_query = `
    SELECT
    *
    FROM
    director;
    `;
  const getting_all_directors = await movie_db_server.all(all_directors_query);
  response.send(
    getting_all_directors.map((dir_key) => {
      return change_director_key(dir_key);
    })
  );
  //response.send(getting_all_directors);
});

//Returns a list of all movie names directed by a specific director
let changemovie_name_label = (mov_lab) => {
  return {
    movieName: mov_lab.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  const movies_directed_query = `
  SELECT
  movie_name
  FROM
  movie
  WHERE
  director_id=${directorId}
  ;
  
  `;
  const movies_directed = await movie_db_server.all(movies_directed_query);
  response.send(
    movies_directed.map((mov_lab) => {
      return changemovie_name_label(mov_lab);
    })
  );

  //response.send(movies_directed);
});

module.exports = app;
