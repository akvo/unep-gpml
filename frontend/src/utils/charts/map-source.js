const features = window.__UNEP__MAP__.features.map((x, i) => {
    const disputed = x.properties.cd.split("")[0] === "x";
    return {
        ...x,
        properties:  {
            name: !disputed ? x.properties.cd : "disputed-" + i,
            cd: x.properties.name,
        }
    }
});

export const mapSource = {...window.__UNEP__MAP__, features: features};
