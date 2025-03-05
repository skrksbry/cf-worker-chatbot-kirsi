# Cloudflare Warkers AI 와 OpenAI 를 이용한 Chatbot 예제

<img src="https://skrksbry.synology.me/web_images/cchatn.jpeg" alt="image" style="width:350px;"/>

이 프로젝트는 실제 개인 Tech Blog에 적용한 Chatbot의 기반 소스를 변형하여 만든 소스입니다.

Cloudflare의 **Vectorize (Vector DB)** 를 사용한 **RAG(Retrieval-Augmented Generation, 검색 증강 생성)** 을 통해 AI에게 구체적인 출처를 제시하고 할루시네이션을 최소화할 수 있습니다.

RAG를 통해 유저가 원하는 정확한 결과값을 명확한 출처에서 인용·참고하여 **LLM의 응답을 더욱 올바르게 유도**할 수 있습니다.

본 프로젝트에서는 **Cloudflare Workers AI**와 **Cloudflare의 Vectorize (Vector DB)** 를 이용하고 있으며, Vector DB의 경우 **Qdrant, Milvus, Redis** 등으로 대체할 수 있습니다.

> **💡 참고:**
> - **Vectorize와 Qdrant**와 같이 SaaS 형태의 서비스를 사용하는 것이 초기 비용이 적어 학습하기 좋습니다.

## 📌 예시에서 사용하는 모델

| 설정 | 텍스트 생성 모델 | 임베딩 모델 |
|---|---|---|
| `only-cloudflare`, `insert-vectorize`, `vectorize-rag-cloudflare` | `@cf/meta/llama-2-7b-chat-int8` | `@cf/baai/bge-base-en-v1.5` |
| `only-openai`, `insert-vectorize-with-openai`, `vectorize-rag-with-openai` | `gpt-4o-mini` | `text-embedding-3-small` |
| `only-deepseek` | `deepseek-chat` | - |

## ⚠️ 모델 관련 주의사항

- **Cloudflare 모델**(`@cf/meta/llama-2-7b-chat-int8` 및 `@cf/baai/bge-base-en-v1.5`)은 다국어를 지원하지 않으므로 영어를 사용해야 합니다. (**일일 10,000 뉴런 무료**)
- **OpenAI 모델**은 전부 다국어를 지원하지만 **유료**입니다.

## 🚀 시작하기 전에
이 소스코드는 바로 배포하여 동작하는 소스코드가 아니므로, **사용자의 목적에 맞게 수정하여 사용해야 합니다.**

- **Prompt Engineering 시** RAG를 통해 전달되는 내용은 항상 마지막에 위치하는 것이 좋습니다. (Cache hit을 위해)
- **OpenAI의 Cache Enable**은 **1024 Token 이후부터 발생**합니다.
- **Deepseek Cache**는 항상 Enable 상태입니다. (따라서 프롬프트 끝에 위치하면 비용을 유의미하게 절감할 수 있음)

## 🔧 시작하기

### 필수 조건
- **Cloudflare 계정**이 필요합니다.
- **Node.js 16.1 이상의 LTS 버전**을 설치하세요.

### 설정 및 배포
```bash
# 프로젝트 설정 변경
vim wrangler.jsonc  # Project Name 변경 및 필요한 API 설정 수정

# 참고하고자 하는 파일을 보고 index.ts에 옮겨 작성 및 ## 내에 해당하는 부분을 수정

# 배포 실행
npx wrangler deploy
```

### 로그인 및 테스트
- 배포 시 발생하는 **브라우저 인증을 통해 Cloudflare 로그인**
- **Cloudflare Workers Dashboard**에서 배포된 Workers의 링크를 확인하고 **Chatbot에 Request**

### 📌 OpenAI GPT 모델 사용 시 가입
📄 [OpenAI Platform](https://platform.openai.com/)

### 📌 Deepseek 모델 사용 시 가입
📄 [Deepseek Platform](https://deepseek.com/)

---

## 🎯 프롬프트 엔지니어링

OpenAI나 Llama와 같은 **사전 학습된 LLM**은 이미 고도로 학습되어 있으므로, **Prompt 작성만으로도 훌륭한 결과값을 도출할 수 있습니다.**

또한, OpenAI / Deepseek의 **API 문서에서 Prompt 작성 방법을 쉽게 찾을 수 있습니다.**

### 🛑 Lost in the Middle 현상
LLM에는 **Lost in the Middle** 이라는 현상이 있습니다.
이는 **삽입하려는 정보의 양이 많아질 때 중간 내용을 망각하는 현상**을 의미합니다.

📄 관련 논문: **[링크 삽입]**

따라서 전달해야 할 컨텍스트(예: 이전 대화 내용 등)가 길어지면 **프롬프트 체이닝(Prompt Chaining)** 등의 기법을 활용해야 합니다.

> **⚠️ 주의:**
> - 프롬프트 체이닝을 활용하면 **LLM과의 인터페이스가 2번 이상 발생**하여 **유료 모델에서는 토큰 사용량이 증가**할 수 있으므로 주의해야 합니다.

---

## ✅ 실제 사용 시 Workflow

1. 유저 질문 발생
2. **Embedding을 통해 벡터 DB 조회**
3. **매칭된 벡터를 기반으로 원본 문서를 RDBMS 청킹 DB 및 원본 DB에서 각각 검색**
4. **매칭 점수가 높으면** 분할 저장(청킹)된 원문을 프롬프트에 전달
5. **매칭 점수가 낮거나 애매하면**, 제목에 해당하는 분할 벡터라면 **원본 Markdown 게시글의 요약본을 프롬프트에 전달**

---

## 🔮 Feature

이 프로젝트의 원본이 되는 프로젝트는 아래와 같은 로드맵에 따라 개선될 예정입니다.

- **Vectorize에서 Qdrant로 Migration**  
  - (Qdrant를 Mac Mini 서버에서 **On-Premise로 운영**할 예정)
- **게시글·질문의 분류를 ML을 통해 수행 및 RAG 강화**
- **Cost / Output 최적화 및 효율적인 Prompt 구성**

---

## 참고한 문서

[Cloudflare Vectorize API](https://developers.cloudflare.com/api/node/resources/vectorize/)

[Cloudflare Workers Document](https://developers.cloudflare.com/workers/)

[Openai API Document](https://platform.openai.com/docs/api-reference/)

[Deepseek API Document](https://api-docs.deepseek.com/)
