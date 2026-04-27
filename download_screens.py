import urllib.request
import os

screens = [
    {
        "name": "Landing Page - The Mission",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc0NDY3MTMwZWE1MjQ0N2Q4NWQzNmNmNmY3MmUxNzY3EgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhLrUH_5tayWWmJu5tI8yDsN1NuA_29RQYoF3BEV97Vxh98tDOJdJ2JE4Q6BDhMG7TxE1EBNOTyvJpubyqltWShowkXK1Nd9_sq692RDy7Euts3LXvfI-QbbJB5b8LHsmZzwDVmxE-MTJlA1YANHO3S0pJY8TLFAPmz_BXFEWb0q4TdY0DV05cOCrsHg3Ecrov-APWHKD4mZmEb-CvMwM-qd-igaBbdPiqLE54xe9m4-wTbeb_Et15Uajk6"
    },
    {
        "name": "User Workspace Dashboard",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNmY2MwN2EyM2YxYTQ3ZjZiZTRiNTYyZjBmNWUxNmE3EgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uheaREfDnEJZR0R5cjd2lZs71p4ylWQG4aIDk-ap353Y-NYezod2FJDjVZIYjd7ec86y3otPvapy-zwB8UK19udWtm3_tQuG8tHY9kmanilDSfjIxANSX8yKGPF23O0Y2fBwhAcslfUqyVCr9r9sODRaY7BUMf72gCbcIYb8HAO3ikMjfStCKCUj11-ojFYhlgNhjQ0a1xF-0Baykx6_0yWXJQzwPeHPUcqC0djDDMiKHctleWct2CvRUFe"
    },
    {
        "name": "Auth and Onboarding",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVhNTgxNWNhYTEzZDQ4YTY5NmQ5OWRiZDhhNGVkMzhmEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ugYtUpVP84eUr5mcI3CrLGrn7K4i2DUMRd5d3CHkB8VJ-iWogED21TAB9Lbg9NpX631CWsoSFhjVo8Zqx9GF5izhtLIMPpfWp08AgGzEuPS8_QWY8PprkSNEheKi9w24DLKJF4wMr1aswsT5ignS4fDsFvyZieJ_cQnUtyqoWn9dga0v-g5z58ykE45t-V8klSJbtysrs2Pd9Kbu70ueaT7bOVLUtnoHwpl3rfD9PaPRNCPHiCtzw5Tpbt5"
    },
    {
        "name": "Dashboard - Success State",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzBmZGY4NzAyNzhhMDQ2ODdhYzkzNTM0NjNlY2Y5MWRlEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uj9hpcJ03U0w0sM_r73i9SnJCsw8K8pPLhtjKagd_ldyDjqEVXNlUO0iLiJ7cdjpPXR2sURBi-iwgwFUbea9LMJGlY_C_7T20CFqZ_y4Cppg3e5lRxMSh7Z3EhS0BaDHmOshrMqOAwFETG4Q-Du6iWMycHidSZaR6VLmDRRGA3gYv2WpfAM9XjTl3ujfBFmlYd_Kcf_6yzHemjKlqHr3Mptru3_QlgKEW1eTuekfuQsamrxx5g4Hsit1puC"
    },
    {
        "name": "Dashboard - Empty State",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQwN2E0YmYyZDcwZDQzYTM5NWMwMWQ2MTU5NjRkYTEyEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiVmyBom_uKXMP09zYHExoRj509IRZr5rZ5s2FpobWMMSW65fEG5tvggTbx53rO2b6whWWpcT3PzEqQJcd-lPpH8g0StLRZD8gy4oTmMGT6D5fAUPIHmqxb8oVz2uHHvj0PxrV5QiCVVIBEKgdTVYldcMiVMOOSohlPnG3ilrBW6j4_Kkh3tQHH_jP13R1eIIOuZIvET_UxTFq5o8hWrQ2FmiGVnkc8s8k9tJzEFAgq9nvGGVbcz1zI8RoG"
    },
    {
        "name": "Dashboard - Error State",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U2MmVjMjk1NzlhYTQwODNiMDcwNmNlZjQ4ZDZhNzk4EgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhksccpb1mQ1g5z7rEQDxaYdv5Pth6RDvYxYfppoGAADyBRrDuBJ_XJwQGMOMTnyQH3IVnl4ARf1RdhwWPU6hT2B2BDJgWIw28xTuvsLMGRRZQ5ot-HcQ_1-8gc5rb3Hj7Zwo5iT9Vy1AoneRAsdq7fqosKUtdQsS4xedv0R8DDrP8qd5gRLBCWtqmGKyvqSPIoeyGDZEN-TNfnrzaXFE3_mWVsYmWxY3zGiqyNKONNMzvIyFGh3bLCi3PM"
    },
    {
        "name": "Dashboard - Processing State",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FmZGQyMjg0MjNmNjQyNjdhZDBiZTQ5OWE3MzJjMGNmEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujM5D2_JYX6d3VfkJM-wAD5l7YhPDuawq-QsXhbtlLbsU-h1aIVppdDyrR7uVPNKKci7KmuxbKhvkBp6x7F9MteCilhH0QNzhAbHq219Zo4F8uebS5E-4fJ4_aW36AgxcSHOPZ6VhtoA-5dYODyGhKJTldIfmH5RG1uql9OO_Wzz5Zawe7qqcUCBG5vhreiN5C82OpdyxUMZEG9-OkkVeMhzVbTMt-kPONaIzVfVEkNjDFM3tKb8CKyuFhr"
    },
    {
        "name": "The Carbon Portfolio Digital Vault",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzlhOTQyYjI1MDA1YTRhNzY5MDM0NWRjM2I0OWNiZTgwEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uh6n1PgJHO8NXTHJsu2aogtvCptvjwg7xXOUttkZ-1pFbEg62YmMtW5LZ3NWtriL4amu3RwCqo7dhhqYF6XF2yNe8wcke07Qg7tBtL1darXb-sgQFMPg63Lua4wceaegBbNVLiQhNLRbB5T_O4NMIVUXglBjXy4O66j4aS0bAClnC23O7zONPYxr8OsXsxKB_x6_AvUf3_enF4IhoedWyso8smDKK6MaI49G1rw6iIjW6kaiyHyMID89l5l"
    },
    {
        "name": "Login - IndiCarbon AI",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2JmYjQ5OWM3ODhlZjRiMDU4NDlmNzg0NjBkMWQyOTVlEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uj4U2H_qt5R8Vk9BHBUl4DWZyTQ34Kt6lO9bz9W2yaytEQbttWuQzGb2AC2wlLfNkImeoVEq5EGMLnztWODGF6Ut3h_XLW6sNZMR50s23KXxuMqCBV0voYr1guzuitdcTkw3i_wRidyIuOy02z1X1KNitQ0tRiALme57_2kB_tZgZ5BsUYea6Q0xHC8RFKVE8S52ZW0FJXQVscJrnNMRo0AxpSu3m1l65x8neX8xEqywdDWCZLlYcmnx-k"
    },
    {
        "name": "Super Admin and Sales Command Center",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FkMmQ1YzEwOWU1ODQ2NTRiMGMzODk3MzQ5ODE0MzZkEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujtN1KPY8RslOTZVBvpF6A_AqpPct-UItFm2wjigiGtsvOyzkc-CykM9jj4f__Z7R3N_AuQpMvTWEzkjE7RI0f-YXpjRggSlmpREdzP-gaJgFYbp3zomRQEC78T4AHk0qzQdfLfrkGr6eDxC-xS8TJQOC0R22LhAf_rA4hMvPUkij5JQUKdxqMriyDgaISYrkH8nYIDLDMF08Ek2Za0cGo-itmLxoAnntXm3tItvuLrAY3oKmKWd1v-O_6z"
    },
    {
        "name": "Register and Onboarding - IndiCarbon AI",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2RmOGI1Zjc4ZWY4YjRjYTI5MDViNTYxNzA5ZjI4YTkwEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiBRyKA1lUxF6F6a5sOAtmu5BaZpuv4v1PuVAcnaUumWjLBv1lzf9Ctq6MHAmGOBdsWafAlfrBGy388eAQp1f0NrrgaM3uH6ZkJ__u4W-9qACE0k-XsOCYQJYL9VBTi3bEJ_H31F7mgUNi9yrR9Z9jz8AqFZ5cNJGUhuU-c2JTIUNGNyNvD5dBD5B__UoSXxAhhqVk607ZeLEQJHBcaFlV1Nsh_qNBCMxa6YQP-UBbocLqP4K8k5AMt3Ogi"
    },
    {
        "name": "The Command Center Admin and Sales",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzJjMTY4NGFiNmYzZjQ0ZDNhZWMzNThlMmYxZTk5ZDIzEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhOiqfGxJPj8k2UWoUzr0PfT7pSjeqztbSxTcUiXvDdzb1Poj13TWN2EploiK8WB3HERZIDkRGgYKdo_IIVQ7zTXy6i40p0hB90dSia0-JkKSc-w7mS3KyqHemeIiWsj8UIvsR60JNLHFdKln5ffzCSRQ5P_gxk4RGbL0zstuw9t3CDf--82FZUHLng3Y7MuUMSey6mEA5tqop9UinXikMy1bbZXl1GvzOT-mtpaFsipo3kgETsAiU5xYQF"
    },
    {
        "name": "Climate Lab AI Simulator",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc1NTlmMTBjNTk2ZDQ2YWE4MDQ1ZjcyMDFhY2FkODgxEgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ugXEkoaTPbNhwWku9FjggrKpwJE2AMPaMmpX5TyHfV1deuTNjfJHmDSdmfv4jeZd9KgMPAx9GKmz-YZMJvMnT_mFUJrRo3zUxR0_Kmd8ELCphq5H_TKrOLP-Afnbnia-4MxBuiVYEHJ8_x3Ru-rYBsqsrPwNeV5KKCpAbms-cKUfjn6maSJ44SCgBL60zL4trQ9Nv22rqd4a91rk7ygJjgufslA6w2MFtk0O9doZyRxBIXM1BY5ESl0LCbu"
    },
    {
        "name": "The Mission Narrative Journey",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIwOTlmZmU1YjI4ODRkZjVhOTcxN2Q3MjIxM2QzN2Q2EgsSBxC-jsDhuxgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDQ4NTM2NjA2MTcwNzkwODU4OQ&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujWcUWzSO8FtGeA_6QMrbNUqotoj4Btcn_dGegXRKjhDG3jE2aefUQh_sCfXsKnrCceFu1qffJj0rkkhsDco6k4VA-qdxK4eDnZCy5HuVbOJhq_YZIqmvttAO2m8JqGikYijagc-kNaVsvQrC8gjh_FdmXuziCFtAV8E0EcCqy64br4TLlnTAjI8h-vo6WbHAXXWu-DaLUZSloaC5fnLGAXV-_9pcdFgWolHAzw8BpmF-_lYTF7FN9Dj4c"
    }
]

os.makedirs('d:/IndiCarbon/apps/frontend/stitch_screens/html', exist_ok=True)
os.makedirs('d:/IndiCarbon/apps/frontend/stitch_screens/img', exist_ok=True)

import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for screen in screens:
    name = screen["name"].replace(" ", "_")
    print(f"Downloading {name}...")
    req_html = urllib.request.Request(screen["html"], headers={'User-Agent': 'Mozilla/5.0'})
    req_img = urllib.request.Request(screen["img"], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req_html, context=ctx) as response, open(f'd:/IndiCarbon/apps/frontend/stitch_screens/html/{name}.html', 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        with urllib.request.urlopen(req_img, context=ctx) as response, open(f'd:/IndiCarbon/apps/frontend/stitch_screens/img/{name}.png', 'wb') as out_file:
            data = response.read()
            out_file.write(data)
    except Exception as e:
        print(f"Error downloading {name}: {e}")
