import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);

const uri = "http://localhost:3000";

const newRelation = {
  filme_id: "11111111-1111-1111-1111-111111111111", // substitua por um ID real de filme existente no seu banco
  ator_id: "22222222-2222-2222-2222-222222222222", // substitua por um ID real de ator existente
  papel: "Protagonista",
  ordem_credito: 1,
};

const updatedRelation = {
  papel: "Coadjuvante",
  ordem_credito: 2,
};

let movieId = newRelation.filme_id;
let actorId = newRelation.ator_id;

describe("🎬 Rotas de Relações Filme-Ator (/movie-actors)", () => {
  // --- TESTE POST /movie-actors ---
  describe("POST /movie-actors - Criar relação", () => {
    it("Deve criar uma nova relação filme-ator (201)", (done) => {
      request.execute(uri)
        .post("/movie-actors")
        .send(newRelation)
        .end((err, res) => {
          chai.expect(res).to.have.status(201);
          chai.expect(res.body).to.be.an("object");
          chai.expect(res.body).to.have.property("filme_id").that.equals(movieId);
          chai.expect(res.body).to.have.property("ator_id").that.equals(actorId);
          done();
        });
    });

    it("Deve retornar 400 se IDs obrigatórios estiverem ausentes", (done) => {
      const invalidRelation = { papel: "Figurante" };
      request.execute(uri)
        .post("/movie-actors")
        .send(invalidRelation)
        .end((err, res) => {
          chai.expect(res).to.have.status(400);
          chai.expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  // --- TESTE GET /movie-actors ---
  describe("GET /movie-actors - Listar todas as relações", () => {
    it("Deve retornar status 200 e uma lista de relações", (done) => {
      request.execute(uri)
        .get("/movie-actors")
        .end((err, res) => {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an("array");
          chai.expect(res.body.some(r => r.filme_id === movieId && r.ator_id === actorId)).to.be.true;
          done();
        });
    });
  });

  // --- TESTE GET /movie-actors/movie/:filme_id ---
  describe("GET /movie-actors/movie/:filme_id - Listar atores de um filme", () => {
    it("Deve retornar status 200 e lista de atores", (done) => {
      request.execute(uri)
        .get(`/movie-actors/movie/${movieId}`)
        .end((err, res) => {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an("array");
          done();
        });
    });

    it("Deve retornar 400 se o ID não for informado", (done) => {
      request.execute(uri)
        .get("/movie-actors/movie/")
        .end((err, res) => {
          chai.expect(res).to.have.status(404); // rota não encontrada
          done();
        });
    });
  });

  // --- TESTE GET /movie-actors/actor/:ator_id ---
  describe("GET /movie-actors/actor/:ator_id - Listar filmes de um ator", () => {
    it("Deve retornar status 200 e lista de filmes", (done) => {
      request.execute(uri)
        .get(`/movie-actors/actor/${actorId}`)
        .end((err, res) => {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an("array");
          done();
        });
    });
  });

  // --- TESTE PUT /movie-actors/:filme_id/:ator_id ---
  describe("PUT /movie-actors/:filme_id/:ator_id - Atualizar relação", () => {
    it("Deve retornar 200 e atualizar a relação", (done) => {
      request.execute(uri)
        .put(`/movie-actors/${movieId}/${actorId}`)
        .send(updatedRelation)
        .end((err, res) => {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an("object");
          chai.expect(res.body.papel).to.equal(updatedRelation.papel);
          done();
        });
    });

    it("Deve retornar 404 se a relação não existir", (done) => {
      const fakeMovie = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const fakeActor = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
      request.execute(uri)
        .put(`/movie-actors/${fakeMovie}/${fakeActor}`)
        .send(updatedRelation)
        .end((err, res) => {
          chai.expect(res).to.have.status(404);
          done();
        });
    });
  });

  // --- TESTE DELETE /movie-actors/:filme_id/:ator_id ---
  describe("DELETE /movie-actors/:filme_id/:ator_id - Remover relação", () => {
    it("Deve retornar 204 ao remover a relação", (done) => {
      request.execute(uri)
        .delete(`/movie-actors/${movieId}/${actorId}`)
        .end((err, res) => {
          chai.expect(res).to.have.status(204);
          done();
        });
    });

    it("Deve retornar 404 se tentar remover relação inexistente", (done) => {
      const fakeMovie = "cccccccc-cccc-cccc-cccc-cccccccccccc";
      const fakeActor = "dddddddd-dddd-dddd-dddd-dddddddddddd";
      request.execute(uri)
        .delete(`/movie-actors/${fakeMovie}/${fakeActor}`)
        .end((err, res) => {
          chai.expect(res).to.have.status(404);
          done();
        });
    });
  });
});
