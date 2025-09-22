"use client";
import { useEffect, useState } from "react";
import { gql } from "../gql.js";

export function useUser() {
  const [state, setState] = useState({ user: null, loading: true, error: null });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await gql(`
          {
            user {
              id
              login
              firstName
              lastName
              email
              auditRatio
              totalUp
              totalDown
              transactions_aggregate(where: { type: { _eq: "xp" } }) {
                aggregate {
                  sum { amount }
                }
              }
            }
          }
        `);

        const u = data?.user?.[0] || null;
        const totalXP = u?.transactions_aggregate?.aggregate?.sum?.amount ?? 0;

        if (mounted) {
          setState({
            user: u
              ? {
                  id: u.id,
                  login: u.login,
                  firstName: u.firstName ?? "",
                  lastName: u.lastName ?? "",
                  email: u.email ?? "",
                  totalXP,
                  auditRatio: Number(u.auditRatio ?? 0),
                  totalUp: Number(u.totalUp ?? 0),
                  totalDown: Number(u.totalDown ?? 0),
                }
              : null,
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (mounted) setState({ user: null, loading: false, error: e });
      }
    })();

    return () => { mounted = false; };
  }, []);

  return state; // { user: {id,login,firstName,lastName,email,totalXP}, loading, error }
}
