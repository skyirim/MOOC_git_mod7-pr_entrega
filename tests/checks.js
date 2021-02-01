/**
 * Checker Script for mooc_git-entrega7_branch
 */


// IMPORTS
const git = require('simple-git/promise');
const Utils = require("./utils");
const to = require("./to");
const path = require('path');
const fs = require('fs-extra');



// CONSTS
const REPO_NAME = 'MOOC_git_mod7-cal_2com';
const PATH_ASSIGNMENT = path.resolve(path.join(__dirname, "../"));
const PATH_REPO = path.join(PATH_ASSIGNMENT, REPO_NAME);
const BRANCH_NAME = "inverse";

// GLOBALS
let error_critical1 = null;
let error_critical2 = null;
let output = null;
let mygit = git(PATH_ASSIGNMENT);
let account_student = null;
let account_auxiliary = null;
let log = null;
let log_repo_principal = null;
let REPO_URL = "";
//`https://github.com/${account_student}/${REPO_NAME}`;
let AUXILIARY_REPO_URL = "";
//`https://github.com/${account_auxiliary}/${REPO_NAME}`;


describe('Pull Request', function () {

    it("(Prechecks) Comprobando que existe 'git_account'", async function () {
        this.score = 0;
        this.msg_err = "No se ha encontrado el fichero 'git_account' que debe contener el nombre de usuario de github";

        account_student = fs.readFileSync(path.join(PATH_ASSIGNMENT, 'git_account'), {encoding: 'utf8'}).replace(/^\s+|\s+$/g, '');;
        REPO_URL = `https://github.com/${account_student}/${REPO_NAME}`;
        this.msg_ok = `Se ha encontrado el fichero 'git_account': ${account_student}`;
        should.exist(account_student);
    });

    it("(Prechecks) Comprobando que existe 'git_account2'", async function () {
        this.score = 0;
        this.msg_err = "No se ha encontrado el fichero 'git_account2' que debe contener el nombre de usuario de github";

        account_auxiliary = fs.readFileSync(path.join(PATH_ASSIGNMENT, 'git_account2'), {encoding: 'utf8'}).replace(/^\s+|\s+$/g, '');;
        AUXILIARY_REPO_URL = `https://github.com/${account_auxiliary}/${REPO_NAME}`;
        this.msg_ok = `Se ha encontrado el fichero 'git_account2': ${account_auxiliary}`;
        should.exist(account_auxiliary);
    });

    it(`Comprobando que existe el repositorio '${REPO_NAME}' en el segundo usuario`, async function () {
        const expected = AUXILIARY_REPO_URL;
        this.score = 0.1;
        this.msg_ok = `Encontrado ${expected}`;
        [_, _] = await to(fs.remove(PATH_REPO));
        [error_repo, _] = await to(mygit.clone(expected));
        if (error_repo) {
            this.msg_err = `No se encuentra ${expected}`;
            error_critical1 = this.msg_err;
            should.not.exist(error_critical1);
        }
        await to(mygit.cwd(PATH_REPO));
        should.not.exist(error_repo);
    });

    it("Comprobando que el repositorio principal es el origen del fork del repositorio auxiliar", async function () {
        const expected = account_student;
        this.score = 0.1;
        // Buscando commits en la rama main
        [error_log, log] = await to(mygit.log());
        if (error_log) {
            this.msg_err = `Error al leer los logs en ${PATH_REPO}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        commit_1_main = log.all[log.all.length - 1].hash.substring(0, 7);
        commit_2_main = log.all[log.all.length - 2].hash.substring(0, 7);
        commit_3_main = log.all[log.all.length - 3].hash.substring(0, 7);
        commit_4_main = log.all[log.all.length - 4].hash.substring(0, 7);
        commit_5_main = log.all[log.all.length - 5].hash.substring(0, 7);
        if (!commit_4_main) {
            this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log.all[log.all.length - 4]}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        [error_show, output] = await to(mygit.show([commit_4_main, '--name-only', '--pretty=full']));
        if (error_show) {
            this.msg_err = `Error al leer el commit ${commit_4_main} de la rama main`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        this.msg_err = `El repositorio ${REPO_NAME} de cuenta 1 NO es el origen del Fork del repositorio de cuenta 2.`;
        this.msg_ok = `El repositorio ${REPO_NAME} de cuenta 1 es el origen del Fork del repositorio de cuenta 2.`;

        Utils.search(expected, output).should.be.equal(true);
    });

    it("Buscando Título con autor en los commits de la rama main del repositorio auxiliar", async function () {
        const expected = "Título con autor";
        this.score = 0.1;
        if (!commit_4_main) {
            this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log.all[log.all.length - 4]}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        [error_show, output] = await to(mygit.show([commit_4_main]));
        if (error_show) {
            this.msg_err = `Error al leer el commit ${commit_4_main} de la rama main`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        this.msg_err = `No se ha encontrado '${expected}' en la rama main ${commit_4_main}`;
        this.msg_ok = `Se ha encontrado '${expected}' en la rama main ${commit_4_main}`;

        Utils.search(expected, output).should.be.equal(true);
    });

    it(`Comprobando que el repositorio auxiliar tiene la rama '${BRANCH_NAME}'`, async function () {
        const expected = BRANCH_NAME;
        this.score = 0.1;
        if (error_critical1) {
            this.msg_err = error_critical1;
            should.not.exist(error_critical1);
        } else {
            let output;
            this.msg_ok = `Encontrada la rama '${BRANCH_NAME}'`;
            [error_branch, branches] = await to(mygit.branch());
            if (error_branch) {
                this.msg_err = `Error al leer las ramas en ${PATH_REPO}`;
                error_critical1 = this.msg_err;
                should.not.exist(error_critical1);
            } else {
                output = branches.all;
            }
            const no_branch = !Utils.search(expected, output);
            if (no_branch){
                this.msg_err = `No se encuentra la rama '${BRANCH_NAME}' en ${AUXILIARY_REPO_URL}`;
                error_critical1 = this.msg_err;
                should.not.exist(error_critical1);
            }
            Utils.search(expected, output).should.be.equal(true);
        }
    });

    it(`Comprobando que la rama 'master' está integrada en '${BRANCH_NAME}' en el repositorio auxiliar`, async function () {
        const expected = "inverse";
        this.score = 0.05;
        if (error_critical1) {
            this.msg_err = error_critical1;
            should.not.exist(error_critical1);
        } else {
            this.msg_ok = `La rama 'master' está integrada en '${BRANCH_NAME}' en ${AUXILIARY_REPO_URL}`;
            [error_log, log] = await to(mygit.log([`origin/${BRANCH_NAME}`]));
            if (error_log) {
                this.msg_err = `Error al leer los logs de ${PATH_REPO}`;
                error_critical1 = this.msg_err;
                should.not.exist(error_critical1);
            }
            let output = log.all[0]["message"];
            this.msg_err = `'${expected}' no se ha encontrado en el último commit de la rama '${BRANCH_NAME}' en '${AUXILIARY_REPO_URL}'`;
            Utils.search(expected, output).should.be.equal(true);
        }
    });

    it(`Comprobando que la rama '${BRANCH_NAME}' está integrada en 'master' en el repositorio auxiliar`, async function () {
        const expected = "inverse";
        this.score = 0.05;
        if (error_critical1) {
            this.msg_err = error_critical1;
            should.not.exist(error_critical1);
        } else {
            this.msg_ok = `La rama '${BRANCH_NAME}' está integrada en 'master' en ${AUXILIARY_REPO_URL}`;
            [error_log, log] = await to(mygit.log());
            if (error_log) {
                this.msg_err = `Error reading logs from ${PATH_REPO}`;
                error_critical1 = this.msg_err;
                should.not.exist(error_critical1);
            }
            let output = log.all[0]["message"];
            this.msg_err = `'${expected}' no se ha encontrado en el último commit de la rama 'master' en '${AUXILIARY_REPO_URL}'`;
            Utils.search(expected, output).should.be.equal(true);
        }
    });

    it("Buscando 1/x en los commits de la rama main del repositorio auxiliar", async function () {
        const expected = "1/x";
        this.score = 0.1;
        if (!commit_3_main) {
            this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log.all[log.all.length - 3]}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        [error_show, output] = await to(mygit.show([commit_3_main]));
        if (error_show) {
            this.msg_err = `Error al leer el commit ${commit_3_main} de la rama main`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        this.msg_err = `No se ha encontrado '${expected}' en la rama main ${commit_3_main}`;
        this.msg_ok = `Se ha encontrado '${expected}' en la rama main ${commit_3_main}`;

        Utils.search(expected, output).should.be.equal(true);
    });

    it("Buscando que el fichero calculator.html contenga el título requerido", async function () {
        const expected = "<h1>";
        this.score = 0.03;
        if (!commit_4_main) {
            this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log.all[log.all.length - 4]}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        [error_show, output] = await to(mygit.show([commit_4_main]));
        if (error_show) {
            this.msg_err = `Error al leer el commit ${commit_4_main} de la rama main`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        this.msg_err = `No se ha encontrado '${expected}' en el fichero calculator.html. Se tiene que incluir el titulo requerido.`;
        this.msg_ok = `Se ha encontrado '${expected}' en el fichero calculator.html`;

        Utils.search(expected, output).should.be.equal(true);
    });

    it("Buscando que el fichero calculator.html contenga el boton x^2", async function () {
        const expected = "square()";
        this.score = 0.03;
        if (!commit_2_main) {
            this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log.all[log.all.length - 2]}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        [error_show, output] = await to(mygit.show([commit_2_main]));
        if (error_show) {
            this.msg_err = `Error al leer el commit ${commit_2_main} de la rama main`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        this.msg_err = `No se ha encontrado el botón x^2 en el fichero calculator.html. No se ha hecho Fork del repositorio de cuenta 1 correctamente.`;
        this.msg_ok = `Se ha encontrado el botón x^2 en el fichero calculator.html`;

        Utils.search(expected, output).should.be.equal(true);
    });

    it(`Comprobando que existe el repositorio '${REPO_NAME}' en el repositorio principal`, async function () {
        const expected = REPO_URL;
        this.score = 0.03;
        this.msg_ok = `Se ha encontrado ${expected}`;
        await to(mygit.cwd(PATH_ASSIGNMENT));
        [_, _] = await to(fs.remove(PATH_REPO));
        [error_repo, _] = await to(mygit.clone(expected));
        if (error_repo) {
            this.msg_err = `No se encuentra ${expected}`;
            error_critical2 = this.msg_err;
            should.not.exist(error_critical2);
        }
        await to(mygit.cwd(PATH_REPO));
        should.not.exist(error_repo);
    });

    it("Comprobando que la rama 'master' del repositorio principal contiene una Pull Request del repositorio auxiliar", async function () {
        const expected = "exito";
        output = "exito";
        this.score = 0.3;
        // Buscando commits en la rama main
        [error_log, log_repo_principal] = await to(mygit.log());
        if (error_log) {
            this.msg_err = `Error al leer los logs en ${PATH_REPO}`;
            error_critical = this.msg_err;
            should.not.exist(error_critical);
        }
        let i;
        let commit_repo_secundario;
        let commit_repo_principal;
        // Comparar hashes de los commits del repertorio principal con los commits del repertorio secundario
        for (i = 1; i <= log_repo_principal.all.length; i++) {
            commit_repo_principal = log_repo_principal.all[log_repo_principal.all.length - i].hash.substring(0, 7);
            if (!commit_repo_principal) {
                this.msg_err = `Error: al leer el commit en la rama main.\n\t\t\tResultado: ${log_repo_principal[log_repo_principal.all.length - i]}`;
                error_critical = this.msg_err;
                should.not.exist(error_critical);
            }
            commit_repo_secundario = log.all[log_repo_principal.all.length - i].hash.substring(0, 7);
            if (commit_repo_secundario.toString() != commit_repo_principal.toString()) {
                output = "fallo";
            }
        }

        this.msg_err = `El repositorio ${REPO_NAME} de cuenta 1 NO contiene un pull request del repositorio de cuenta 2.`;
        this.msg_ok = `El repositorio ${REPO_NAME} de cuenta 1 contiene un pull request del repositorio de cuenta 2.`;

        Utils.search(expected, output).should.be.equal(true);
    });
});
