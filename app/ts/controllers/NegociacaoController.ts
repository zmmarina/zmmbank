import { NegociacoesView, MensagemView } from "../views/index";
import { Negociacoes, Negociacao, NegociacaoParcial } from "../models/index";
import { domInject, throttle } from "../helpers/decorators/index";


export class NegociacaoController {


    @domInject("#data")
    private _inputData: JQuery;

    @domInject("#quantidade")
    private _inputQuantidade: JQuery;

    @domInject("#valor")
    private _inputValor: JQuery;

    private _negociacoes: Negociacoes = new Negociacoes;
    private _negociacoesView = new NegociacoesView("#negociacoesView");
    private _mensagemView = new MensagemView ("#mensagemView");

    constructor(){
        this._negociacoesView.update(this._negociacoes);
    }

    @throttle()
    adiciona(){  

        let data = new Date(this._inputData.val().replace(/-/g, "/"));

        if (!this._eDiaUtil(data)){
            this._mensagemView.update("Apenas negociações em dias úteis.")
            return
        }

        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );

        this._negociacoes.adiciona(negociacao);

        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update("Negociação adicionada com sucesso!");
    }

    private _eDiaUtil(data: Date){
        return data.getDay() != DiaDaSemana.Domingo && data.getDay() != DiaDaSemana.Sabado;
    }

    @throttle()
    importarDados(){

        function isOk(res: Response){
            if(res.ok){
                return res
            } else {
                throw new Error(res.statusText);
            }
        }

        fetch("http://localhost:8080/dados")
        .then(res => isOk(res))
        .then(res => res.json())
        .then((dados: NegociacaoParcial[]) => {
            dados
            .map(dado => new Negociacao(new Date(), dado.vezes, dado.montante))
            .forEach(negociacao => this._negociacoes.adiciona(negociacao))
            this._negociacoesView.update(this._negociacoes)
        })
        .catch(err => console.log(err.message));
    }
}

enum DiaDaSemana{
    Domingo, 
    Segunda, 
    Terça,
    Quarta, 
    Quinta, 
    Sexta, 
    Sabado
}