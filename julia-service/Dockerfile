FROM julia:1.10

WORKDIR /app

COPY Project.toml Manifest.toml ./
RUN julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate(); Pkg.precompile()'

COPY . .

EXPOSE 8080

CMD ["julia", "--project=.", "main.jl"]
