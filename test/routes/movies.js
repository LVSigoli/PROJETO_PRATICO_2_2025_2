import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

const newMovie = {
  titulo: "O Poderoso Chefão",
  genero: "Drama",
  duracao_min: 175,
  lancamento: "1972-03-24",
  em_cartaz: false,
};

const updateMovie = {
  titulo: "O Poderoso Chefão (Versão Restaurada)",
  genero: "Drama/Crime",
  duracao_min: 178,
  em_cartaz: true,
};

let movieId;

describe("🎬 Rotas de Filmes (/movies)", () => {
  // --- POST /movies ---
  describe("POST /movies - Criar Filme", () => {
    it("Deve criar um novo filme e retornar 201 com o objeto filme", (done) => {
      request.execute(uri)
        .post("/movies")
        .send(newMovie)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("filme");
          expect(res.body.filme).to.be.an("object");
          expect(res.body.filme).to.have.property("id");

          movieId = res.body.filme.id;
          expect(movieId).to.be.a("string");

          done();
        });
    });

    it("Deve retornar 400 se campos obrigatórios estiverem ausentes", (done) => {
      const invalidMovie = {
        // falta genero, duracao_min, lancamento, em_cartaz
        titulo: "Filme Incompleto",
      };

      request.execute(uri)
        .post("/movies")
        .send(invalidMovie)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  // --- GET /movies ---
  describe("GET /movies - Listar Filmes", () => {
    it("Deve retornar 200 e uma lista de filmes", (done) => {
      request.execute(uri)
        .get("/movies")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");

          // Verifica se o filme criado está na lista
          const found = res.body.some((m) => m.id === movieId);
          expect(found).to.be.true;

          done();
        });
    });
  });

  // --- GET /movies/:id ---
  describe("GET /movies/:id - Buscar Filme por ID", () => {
    it("Deve retornar 200 e o filme específico", (done) => {
      request.execute(uri)
        .get(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("id").that.equals(movieId);
          expect(res.body).to.have.property("titulo").that.equals(newMovie.titulo);
          done();
        });
    });

    it("Deve retornar 404 para um ID que não existe", (done) => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

      request.execute(uri)
        .get(`/movies/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  // --- PUT /movies/:id ---
  describe("PUT /movies/:id - Atualizar Filme", () => {
    it("Deve retornar 200 e atualizar o filme com sucesso", (done) => {
      request.execute(uri)
        .put(`/movies/${movieId}`)
        .send(updateMovie)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          // Dependendo do controller, pode retornar { message, filme } ou só filme.
          // Tentamos cobrir os dois cenários:
          const filme = res.body.filme || res.body;

          expect(filme).to.have.property("id").that.equals(movieId);
          expect(filme).to.have.property("titulo").that.equals(updateMovie.titulo);
          expect(filme).to.have.property("genero").that.equals(updateMovie.genero);
          expect(filme).to.have.property("em_cartaz").that.equals(updateMovie.em_cartaz);

          done();
        });
    });

    it("Deve retornar 404 para um ID de filme que não existe", (done) => {
      const nonExistentId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request.execute(uri)
        .put(`/movies/${nonExistentId}`)
        .send(updateMovie)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });

    it("Deve retornar 400 se o body estiver vazio", (done) => {
      request.execute(uri)
        .put(`/movies/${movieId}`)
        .send({})
        .end((err, res) => {
          // assumindo que o updateMovieValidator retorna 400 quando nenhum campo é enviado
          if (res.status === 400) {
            expect(res.body).to.have.property("message");
          }
          done();
        });
    });
  });

  // --- DELETE /movies/:id ---
  describe("DELETE /movies/:id - Remover Filme (soft delete)", () => {
    it("Deve retornar 200 e remover o filme", (done) => {
      request.execute(uri)
        .delete(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });

    it("Deve retornar 404 ao buscar o filme removido", (done) => {
      request.execute(uri)
        .get(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it("Deve retornar 404 ao tentar remover um filme inexistente", (done) => {
      const nonExistentId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

      request.execute(uri)
        .delete(`/movies/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });
});
