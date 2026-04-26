from setuptools import setup, find_packages

setup(
    name="shared_logic",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "supabase>=2.3.0",
        "pydantic>=2.6.0",
        "pydantic-settings>=2.2.0",
        "fastapi>=0.111.0",
        "starlette>=0.37.0",
    ],
)
