import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

app.get("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const result = accounts.find((account) => account.id === id)
        if (!result) {
            res.status(404) // res.statusCode = 404
            throw new Error("Conta nao encontrada, verifique a ID")
        }
        res.status(200).send(result)
    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        res.send(error.message)
    }
})

// Negocio:
// Regra: Toda ID de conta comeca com a Letra 'a'.
// Caso eu tente buscar uma conta por ID, 
//   - O que aconteceria se ela nao comecasse com a letra 'a'

app.delete("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id

        if (id[0] !== "a") {
            res.status(400)
            throw new Error("'id' invalido. Deve iniciar com a letra a")
        }

        const accountIndex = accounts.findIndex((account) => account.id === id)

        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
        }

        res.status(200).send("Item deletado com sucesso")

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        res.send(error.message)
    }

})

app.put("/accounts/:id", (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const newId = req.body.id as string | undefined
        const newOwnerName = req.body.ownerName as string | undefined
        const newBalance = req.body.balance as number | undefined
        const newType = req.body.type as ACCOUNT_TYPE | undefined

        // typeOf 30 "number". Em typeOf ele devolve como string, mas neste caso e um numero para validacao de erro.
        if (newId !== undefined) {
            if (newId[0] !== "a") {
                res.status(400)
                throw new Error("'id' invalido. Deve iniciar com a letra a")
            }
        }
        if (newOwnerName !== undefined) {
            if (newOwnerName.length < 3) {
                res.status(400)
                throw new Error("'newOwnerName' precisa ter mais que 2 letras.")
            }
        }
        if (newBalance !== undefined) {
            if (typeof newBalance !== "number") {
                res.status(400)
                throw new Error("'balance' dever ser um um number")
            }

            if (newBalance < 0) {
                res.status(400)
                throw new Error("'balance' nao pode ser negativo.")
            }
        }

        if (newType !== undefined) {
            if (
                newType !== "Ouro" &&
                newType !== "Platina" &&
                newType !== "Black"
            ) {
                res.status(400)
                throw new Error("'type' deve ser uma categoria valida")
            }
        }

        const account = accounts.find((account) => account.id === id)

        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance
        }

        res.status(200).send("Atualização realizada com sucesso")

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        res.send(error.message)
    }

})