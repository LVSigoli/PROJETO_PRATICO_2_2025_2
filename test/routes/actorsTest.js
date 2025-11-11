import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from 'chai-http';

chai.use(chaiHttp);

const uri = 'http://localhost:3000';

const newActor = {
    nome: "Margot Robbie",
    nascimento: "1990-07-02",
    biografia: "Atriz australiana, famosa por Barbie e O Lobo de Wall Street.",
    nacionalidade: "Australiana"
};

const updateActor = {
    biografia: "Atriz australiana. Vencedora de vários prêmios.",
    nacionalidade: "Australiana/Americana"
};

let actorId;

describe('🎭 Rotas de Atores (/actors)', () => {

    // --- TESTE POST /actors ---
    describe('POST /actors - Criar Ator', () => {
        it('Deve criar um novo ator e retornar status 201', (done) => {
            request.execute(uri)
                .post('/actors')
                .send(newActor)
                .end((err, res) => {
                    // 1. ASSERT THE STATUS
                    chai.expect(res).to.have.status(201);

                    // 2. CAPTURE THE ID HERE (THE CRITICAL FIX)
                    actorId = res.body.actor.id;

                    // Optional: Assert the ID was actually captured
                    chai.expect(actorId).to.be.a('string');
                    done();
                });
        });

        it('Deve retornar status 400 se o campo "nome" estiver ausente', (done) => {
            const invalidActor = { nascimento: "2000-01-01" }; // Nome ausente
            request.execute(uri)
                .post('/actors')
                .send(invalidActor)
                .end((err, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.be.an('object');
                    chai.expect(res.body).to.have.property('message').that.includes('nome'); // Verifica se a mensagem de erro menciona o campo obrigatório
                    done();
                });
        });
    });

    // --- TESTE GET /actors ---
    describe('GET /actors - Listar Atores', () => {
        it('Deve retornar status 200 e uma lista de atores', (done) => {
            request.execute(uri)
                .get('/actors')
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.be.an('array');
                    // Verifica se o ator que criamos está na lista
                    chai.expect(res.body.some(a => a.id === actorId)).to.be.true;
                    done();
                });
        });
    });

    // --- TESTE GET /actors/:id ---
    describe('GET /actors/:id - Buscar Ator por ID', () => {
        it('Deve retornar status 200 e o ator específico', (done) => {
            request.execute(uri)
                .get(`/actors/${actorId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.be.an('object');
                    chai.expect(res.body.id).to.equal(actorId);
                    chai.expect(res.body.nome).to.equal(newActor.nome);
                    done();
                });
        });

        it('Deve retornar status 404 para um ID que não existe', (done) => {
            // Um UUID conhecido por não existir ou inválido
            const nonExistentId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
            request.execute(uri)
                .get(`/actors/${nonExistentId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(404);
                    done();
                });
        });
    });

    // --- TESTE PUT /actors/:id ---
    describe('PUT /actors/:id - Atualizar Ator', () => {
        it('Deve retornar status 200 e atualizar o ator com sucesso', (done) => {
            request.execute(uri)
                .put(`/actors/${actorId}`)
                .send(updateActor)
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.be.an('object');
                    chai.expect(res.body.biografia).to.equal(updateActor.biografia);
                    done();
                });
        });

        it('Deve retornar status 404 para um ID de ator que não existe', (done) => {
            const nonExistentId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
            request.execute(uri)
                .put(`/actors/${nonExistentId}`)
                .send(updateActor)
                .end((err, res) => {
                    chai.expect(res).to.have.status(404);
                    done();
                });
        });
    });

    // --- TESTE DELETE /actors/:id ---
    describe('DELETE /actors/:id - Remover Ator', () => {
        it('Deve retornar status 204 (No Content) ao remover o ator', (done) => {
            request.execute(uri)
                .delete(`/actors/${actorId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(204);
                    chai.expect(res.body).to.be.empty; // Não deve retornar corpo na resposta 204
                    done();
                });
        });

        it('Deve retornar status 404 se tentar buscar o ator deletado', (done) => {
            request.execute(uri)
                .get(`/actors/${actorId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(404);
                    done();
                });
        });

        it('Deve retornar status 404 se tentar remover um ator que não existe', (done) => {
            const nonExistentId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
            request.execute(uri)
                .delete(`/actors/${nonExistentId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(404);
                    done();
                });
        });
    });
});