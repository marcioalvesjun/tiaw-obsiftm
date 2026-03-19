import { AuthContextProps } from "react-oidc-context";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AriaService {
    auth : AuthContextProps;
    options : any = {};
    

    constructor(auth : AuthContextProps) {
        this.auth = auth;
        if(this.auth.isAuthenticated) {
            console.log(`Bearer ${this.auth.user?.access_token}`);
            this.options = {headers: {"Authorization": `Bearer ${this.auth.user?.access_token}`}};
        }   
    }

    public async ping() {
        const url = "https://apiapex.tesouro.gov.br/aria/ping";

        return new Promise<Boolean>((resolve, reject) => {
            fetch(url, {...this.options, method: "GET"})
                .then(response => response.text())
                .then(data => {
                    resolve(data === "true");
                });
        });
    }

    

}

export default AriaService;