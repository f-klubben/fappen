import argparse

from cli_helper import user_from_id
from worker_xhr import xhr_call
from pyodide.ffi import to_js

# Restore print function that has been replace by sts
print = _print

# override http functions in requests module

def get(self, url, params):
    return xhr_call("GET", url, to_js(params))

def post(self, url, data):
    return xhr_call("POST", url, to_js(data))

requests.Session.get = get
requests.Session.post = post

# removes product fields that may not be JS transferable

def clean_product(p):
    del p['special']
    return p

# Resume normal startup

def startup(url, room):
    global sts, req_handler, user_mgr

    CONSTANTS['url'] = url
    CONSTANTS['room'] = room

    config = Configuration()
    args = [ '-z' ] # Flag for disabling plugin loader
    _parser = argparse.ArgumentParser(add_help=False)
    _args = pre_parse(args, _parser)

    sts = Stregsystem(config, _args, args)

    req_handler = sts._request_handler
    user_mgr = sts._user_manager