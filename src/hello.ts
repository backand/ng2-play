import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import 'rxjs/Rx'
import {Http, Headers, HTTP_BINDINGS} from 'angular2/http'

@Component({
    selector: 'hello-app',
    template: `
        <h1>Hello, Backand!</h1>
        <label>Choose authentication type:</label>
        <div>
            <label>Username</label>
            <input [value]="username" (input)="username = $event.target.value">
        </div>
        <div>
            <label>Password</label>
            <input [value]="password" (input)="password = $event.target.value">
        </div>
        <button (click)="getAuthTokenSimple()" class="btn btn-success">Token Auth</button>
        <button (click)="useAnoymousAuth()" class="btn btn-danger">Anonymous Auth</button>
        <br/>
        <label>Using {{auth_type}} authentication</label>
        <div>
            <label [class.alert]="is_auth_error" [class.alert-danger]="is_auth_error">{{auth_status}}</label>
        </div>
        <hr/>
        ADD TODO: <input [value]="name" (input)="name = $event.target.value">
        <div>
            <button (click)="getQuote()" class="btn btn-success">Get Items</button>
            <button (click)="postItem()" class="btn btn-warning">Post Item</button>
        </div>
        <br/>
        <label>Result:</label>
        <ul class="list-group" *ngFor="#q of quoteOfTheDay">
            <li class="list-group-item">{{q}}</li>
        </ul>        
    `
})
export class HelloApp {
    name:string = 'World';
    quoteOfTheDay:string[] = [];
    username:string = 'test@angular2.com';
    password:string = 'angular2';


    constructor(public http:Http) {
    }

    api_url:string = "https://api.backand.com";

    get tokenUrl() {
        return this.api_url + "/token";
    }

    auth_type:string = "N/A";
    app_name:string = "angular2";
    auth_status:string = "";
    is_auth_error:boolean = false;
    auth_token:{ header_name : string, header_value: string} = {header_name: '', header_value: ''};

    public getAuthTokenSimple() {
        this.auth_type = 'Token';
        let creds = `username=${this.username}` +
            `&password=${this.password}` +
            `&appName=${this.app_name}` +
            `&grant_type=password`;
        console.log(creds);
        let header = new Headers();
        header.append('Content-Type', 'application/x-www-form-urlencoded');
        this.http.post(this.tokenUrl, creds, {
                headers: header
            })
            .map(res => this.getToken(res))
            .subscribe(
                data => {
                    this.auth_status = 'OK';
                    this.is_auth_error = false;;
                    this.setTokenHeader(data)
                },
                err => {
                    var errorMessage = this.extractErrorMessage(err);

                    this.auth_status = `Error: ${errorMessage}` ;
                    this.is_auth_error = true;
                    this.logError(err)
                },
                () => console.log('Finish Auth'));
    }

    private extractErrorMessage (err) {
        return JSON.parse(err._body).error_description;
    }

    private useAnoymousAuth() {
        this.is_auth_error = false;
        this.auth_type = 'Anonymous';
        this.setAnonymousHeader();
    }

    private setTokenHeader(jwt) {
        if (jwt) {
            this.auth_token.header_name = "Authorization";
            this.auth_token.header_value = "Bearer " + jwt;
            //localStorage.setItem('jwt', jwt);
        }
    }

    private setAnonymousHeader() {
        this.auth_status = "OK";
        this.auth_token.header_name = "AnonymousToken";
        this.auth_token.header_value = "08fd510a-4b52-43fa-938f-f2c841bd3106";
    }

    private getToken(res) {
        console.log(res);
        return res.json().access_token;
    }

    private get authHeader() {
        var authHeader = new Headers();
        authHeader.append(this.auth_token.header_name, this.auth_token.header_value);
        return authHeader;
    }

    public postItem() {
        let data = JSON.stringify({description: this.name});

        this.http.post(this.api_url + '/1/objects/todo?returnObject=true', data,
            {
                headers: this.authHeader
            })
            .retry(3)
            .map(res => {
                console.log(res.json());
                return res.json();
            })
            .subscribe(
                data => {
                    // add to begin of array
                    this.quoteOfTheDay.unshift(data.description);
                    console.log(this.quoteOfTheDay);
                },
                err => this.logError(err),
                () => console.log('OK')
            );
    }

    public getQuote() {

        this.http.get(this.api_url + '/1/objects/todo?returnObject=true', {
                headers: this.authHeader
            })
            .retry(3)
            .map(res => res.json().data.map(r =>
                r.description
            ))
            .subscribe(
                data => {
                    console.log("subscribe", data);
                    this.quoteOfTheDay = data;
                },
                err => this.logError(err),
                () => console.log('OK')
            );
    }

    logError(err) {
        console.error('Error: ' + err);
    }
}

bootstrap(HelloApp, [HTTP_BINDINGS]);