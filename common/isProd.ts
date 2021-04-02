/**
 Copyright Findie 2021
 */

const regexp_prod = /^(--?)?prod(uct(ion)?)?$/i
const regexp_dev = /^(--?)?dev(elop(ment)?)?$/i

const env = process.env['RUNMODE'] || '';
const env_node = process.env['NODE_ENV'] || '';
const args = process.argv.slice(2);

const or = (a: boolean, b: boolean) => a || b;

const env_prod = regexp_prod.test(env) || regexp_prod.test(env_node);
const arg_prod = args.map(arg => regexp_prod.test(arg)).reduce(or, false);
const arg_dev = args.map(arg => regexp_dev.test(arg)).reduce(or, false);

export const isProd = arg_prod ? true : (arg_dev ? false : env_prod);
