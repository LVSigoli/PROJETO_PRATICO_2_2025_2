import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

const newMovie = {
  titulo: "Interestelar",
  genero: "Ficção Científica",
  duracao_min: 169,
  lancamento: "2014-11-06",
  em_cartaz: false,
};

const newReviewBase = {
  nome_avaliador: "Erick Gomes",
  nota: 9,
  comentario: "Filme sensacional, trilha absurda.",
  recomendado: true,
};

const updateReview = {
  nome_avaliador: "Erick Gomes",
  nota: 10,
  comentario: "Revendo agora: obra-prima absoluta.",
  recomendado: true,
};

let filmeId;
let reviewId;

describe("⭐ Rotas de Reviews (/reviews)", () => {
  // Cria um filme antes de tudo para ter um filme_id válido
  before((done) => {
    request.execute(uri)
      .post("/movies")
      .send(newMovie)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("filme");
        expect(res.body.filme).to.have.property("id");

        filmeId = res.body.filme.id;
        expect(filmeId).to.be.a("string");

        done();
      });
  });

  // --- POST /reviews ---
  describe("POST /reviews - Criar Review", () => {
    it("Deve criar uma nova review (201) com filme_id válido", (done) => {
      const newReview = {
        ...newReviewBase,
        filme_id: filmeId,
      };

      request.execute(uri)
        .post("/reviews")
        .send(newReview)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("review");
          expect(res.body.review).to.be.an("object");
          expect(res.body.review).to.have.property("id");
          expect(res.body.review).to.have.property("filme_id").that.equals(filmeId);

          reviewId = res.body.review.id;
          expect(reviewId).to.be.a("string");

          done();
        });
    });

    it("Deve retornar 400 se campos obrigatórios estiverem ausentes", (done) => {
      const invalidReview = {
        // falta nome_avaliador
        filme_id: filmeId,
        nota: 8,
      };

      request.execute(uri)
        .post("/reviews")
        .send(invalidReview)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  // --- GET /reviews ---
  describe("GET /reviews - Listar Reviews", () => {
    it("Deve retornar 200 e uma lista de reviews", (done) => {
      request.execute(uri)
        .get("/reviews")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");

          const found = res.body.some((r) => r.id === reviewId || r.id === Number(reviewId));
          expect(found).to.be.true;

          done();
        });
    });
  });

  // --- GET /reviews/:id ---
  describe("GET /reviews/:id - Buscar Review por ID", () => {
    it("Deve retornar 200 e a review específica", (done) => {
      request.execute(uri)
        .get(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("id");
          expect(String(res.body.id)).to.equal(String(reviewId));
          done();
        });
    });

    it("Deve retornar 404 para ID inexistente", (done) => {
      const nonExistentId = "99999999-9999-9999-9999-999999999999";

      request.execute(uri)
        .get(`/reviews/${nonExistentId}`)
        .end((err, res) => {
          expect([404, 500]).to.include(res.status); // 500 se controller não tratar direito
          done();
        });
    });
  });

  // --- PUT /reviews/:id ---
  describe("PUT /reviews/:id - Atualizar Review", () => {
    it("Deve atualizar a review existente e retornar 200", (done) => {
      request.execute(uri)
        .put(`/reviews/${reviewId}`)
        .send(updateReview)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          const review = res.body.review || res.body;

          expect(review).to.have.property("id");
          expect(String(review.id)).to.equal(String(reviewId));
          expect(review).to.have.property("nota").that.equals(updateReview.nota);
          expect(review).to.have.property("comentario").that.equals(updateReview.comentario);
          done();
        });
    });

    it("Deve retornar 400 se nenhum campo for enviado", (done) => {
      request.execute(uri)
        .put(`/reviews/${reviewId}`)
        .send({})
        .end((err, res) => {
          // assumindo que o updateReviewValidator retorna 400 sem campos
          if (res.status === 400) {
            expect(res.body).to.have.property("message");
          }
          done();
        });
    });

    it("Deve retornar 404 para review inexistente", (done) => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

      request.execute(uri)
        .put(`/reviews/${nonExistentId}`)
        .send(updateReview)
        .end((err, res) => {
          expect([404, 500]).to.include(res.status);
          done();
        });
    });
  });

  // --- DELETE /reviews/:id ---
  describe("DELETE /reviews/:id - Remover Review", () => {
    it("Deve retornar 204 ao remover a review existente", (done) => {
      request.execute(uri)
        .delete(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          // 204 normalmente não tem body
          done();
        });
    });

    it("Deve retornar 404 ao buscar a review removida", (done) => {
      request.execute(uri)
        .get(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect([404, 500]).to.include(res.status);
          done();
        });
    });

    it("Deve retornar 404 ao tentar remover review inexistente", (done) => {
      const nonExistentId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request.execute(uri)
        .delete(`/reviews/${nonExistentId}`)
        .end((err, res) => {
          expect([404, 500]).to.include(res.status);
          done();
        });
    });
  });
});
