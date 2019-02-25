import React from "react";
import ReactDOM from "react-dom";

import paypal from "paypal-checkout";

import greyAPI from "../greyAPI";

import Debt from "../../debts/entities/Debt";

declare var PAYPAL_MODE;

interface PayPalButtonProps {
    username: string;
    amount: number;
    onSuccess: (debt: Debt) => void;
    onError?: (err: any) => void;
    onCancel?: () => void;
}

export default class PayPalButton extends React.Component<PayPalButtonProps> {
    public render() {
        const style = {
            size: "responsive",
            color: "blue",
            shape: "rect",
            label: "pay",
            tagline: false,
        };

        const payment = () => {
            return new paypal.Promise((resolve, reject) => {
                greyAPI.post("/debts/" + this.props.username + "/debts/create-payment", {amount: this.props.amount})
                    .then((res) => {
                        resolve(res.data.paymentId);
                    })
                    .catch(reject);
            });
        };

        const onAuthorize = (data) => {
            greyAPI.post<Debt>("/debts/" + this.props.username + "/debts/execute-payment", {
                paymentId: data.paymentID,
                payerId: data.payerID,
            }).then((res) => {
                res.data.added = new Date(res.data.added);
                this.props.onSuccess(res.data);
            }).catch(this.props.onError);
        };

        const PayPal = paypal.Button.driver("react", { React, ReactDOM });

        return (
            <PayPal
                locale="en_GB"
                env={PAYPAL_MODE}
                style={style}
                commit={true}
                payment={payment}
                onAuthorize={onAuthorize}
                onCancel={this.props.onCancel}
                onError={this.props.onError}/>
        );
    }
}