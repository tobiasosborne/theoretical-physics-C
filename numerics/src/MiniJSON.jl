# A small JSON reader (standard library only), enough for evidence/derivations/c11/golden.json
# and web/tests/golden/*.json. Objects become Dict{String,Any}, arrays Vector{Any}, numbers
# are kept as their source text in a JNum so that no digit is lost before comparison.
module MiniJSON

export parsejson, JNum

struct JNum; text::String; end
Base.BigFloat(n::JNum) = parse(BigFloat, n.text)
Base.Float64(n::JNum) = parse(Float64, n.text)

mutable struct St; s::String; i::Int; end
peekc(st) = st.i <= ncodeunits(st.s) ? st.s[st.i] : '\0'
function skipws(st); while st.i <= ncodeunits(st.s) && st.s[st.i] in (' ', '\n', '\t', '\r'); st.i += 1; end; end
function expect(st, c); peekc(st) == c || error("JSON: expected '$c' at byte $(st.i)"); st.i = nextind(st.s, st.i); end

function value(st)
    skipws(st); c = peekc(st)
    if c == '{'
        expect(st, '{'); d = Dict{String,Any}(); skipws(st)
        if peekc(st) == '}'; expect(st, '}'); return d; end
        while true
            skipws(st); k = str(st); skipws(st); expect(st, ':'); d[k] = value(st); skipws(st)
            if peekc(st) == ','; expect(st, ','); else; expect(st, '}'); return d; end
        end
    elseif c == '['
        expect(st, '['); a = Any[]; skipws(st)
        if peekc(st) == ']'; expect(st, ']'); return a; end
        while true
            push!(a, value(st)); skipws(st)
            if peekc(st) == ','; expect(st, ','); else; expect(st, ']'); return a; end
        end
    elseif c == '"'
        return str(st)
    elseif startswith(SubString(st.s, st.i), "true");  st.i += 4; return true
    elseif startswith(SubString(st.s, st.i), "false"); st.i += 5; return false
    elseif startswith(SubString(st.s, st.i), "null");  st.i += 4; return nothing
    else
        j = st.i
        while j <= ncodeunits(st.s) && (st.s[j] in "+-.eE" || isdigit(st.s[j])); j += 1; end
        j > st.i || error("JSON: unexpected character at byte $(st.i)")
        t = st.s[st.i:j-1]; st.i = j
        return JNum(t)
    end
end
function str(st)
    expect(st, '"'); io = IOBuffer()
    while true
        c = st.s[st.i]
        if c == '"'; st.i += 1; break
        elseif c == '\\'
            e = st.s[st.i + 1]; st.i += 2
            if e == 'u'; print(io, Char(parse(UInt16, st.s[st.i:st.i+3]; base = 16))); st.i += 4
            else; print(io, e == 'n' ? '\n' : e == 't' ? '\t' : e == 'r' ? '\r' : e == 'b' ? '\b' : e == 'f' ? '\f' : e); end
        else
            print(io, c); st.i = nextind(st.s, st.i)
        end
    end
    String(take!(io))
end
function parsejson(s::AbstractString)
    st = St(String(s), 1); v = value(st); skipws(st)
    st.i > ncodeunits(st.s) || error("JSON: trailing text at byte $(st.i)")
    v
end

end # module
