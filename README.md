# Cloudflare Warkers AI 와 OpenAI 를 이용한 Chat bot base
![image](https://skrksbry.synology.me/web_images/cchat.png)

이 프로젝트는 실제 개인 tech blog 에 적용한 chatbot 의 기반 소스를 변형하여 만든 소스입니다.

Cloudflare의 Vectorize (Vector DB) 를 사용한 RAG(Retrieval-Augmented Generation , 검색증강생성)를 통해 AI 에게 구체적인 출처를 제시하고 할루시네이션을 최소화 할 수 있습니다.

RAG를 통해 유저가 원하는 정확한 결과값을 명확한 출처에서 인용, 참고하여 LLM의 응답을 더욱 올바르게 유도할 수 있을 것입니다.

본 프로젝트에서는 Cloudflare Workers AI 와 Cloudflare의 Vectorize ( Vector DB ) 를 이용하고 있으며, Vector DB의 경우 qdrant, Milvus나 Redis등으로 대체할 수 있습니다.

( 단, Vectorize 와 qdrant와 같이 SAAS 형태의 서비스를 사용하는것이 초기 비용이 적어 학습하기 좋습니다. )

## 예시에서 사용하는 모델

1. only-cloudflare, insert-vectorize, vectorize-rag-cloudflare : 텍스트 생성 모델 `@cf/meta/llama-2-7b-chat-int8`, 임베딩 모델 `@cf/baai/bge-base-en-v1.5`
2. only-openai, insert-vectorize-with-openai, vectorize-rag-with-openai : 텍스트 생성 모델 `gpt-4o-mini`, 임베딩 모델 `text-embedding-3-small`
3. only-deepseek : 텍스트 생성 모델 `deepseek-chat`

## 모델 관련 주의사항

Cloudflare 모델인 `@cf/meta/llama-2-7b-chat-int8` 및 `@cf/baai/bge-base-en-v1.5` 은 다국어를 지원하지 않기 때문에 영어를 사용해야 합니다. ( 일일 10000 뉴런 무료 )

Openai 모델은 전부 다국어를 지원하나 유료입니다.

## 시작하기 전에
이 소스코드는 바로 배포하여 동작하는 소스코드가 아님으로 사용하고자 하는 개개인의 목적에 알맞게 수정하여 사용해야 합니다.

1. Prompt engineering 시 RAG를 통해 전달되는 내용은 항상 마지막에 위치하는 것이 좋습니다.( Cache hit 을 위해 ) 
2. Open AI의 Cache enable은 1024 Token 이후부터 발생합니다
3. Deepseek Cache 의 경우 항상 enable입니다. ( 따라서 이 경우 마지막에 있으면 비용을 유의미하게 절감할 수 있습니다. )

## 시작하기
Cloudflare 계정이 꼭 필요합니다.

시작하기 전에 node.js 21 이상의 LTS 버전을 설치하세요.

1. wrangler.jsonc 에서 Project Name 변경
2. Vectorize 사용시 wrangler.jsonc 에서 주석을 해제 ( 다른 API endpoint 사용시 알맞게 내용 변경 )
3. 참고하고자 하는 파일을 보고 `index.ts` 에 옮겨 작성 및 `##` 내에 해당하는 부분 자신의 내용으로 변경.
4. `npx wrangler deploy` 를 통해 배포
5. 배포시 발생하는 브라우저 인증을 통해 cloudflare 로그인
6. cloudflare workers dashboard에서 workers의 링크를 확인하고 접속하여( 혹은 workers 편집창으로 이동하면 우측에서 미리보기 가능 ) chatbot 에 request

만약 Openai 의 GPT모델을 사용하려면 아래에 가입하세요.

[OpenAI Platform](https://auth.openai.com/log-in)

만약 Deepseek의 모델을 사용하려면 아래에 가입하세요.

[Deepseek Platform](https://platform.deepseek.com/sign_in)

## 실제 사용시 Workflow

실제 사용에서는 아래와 같이 사용하고 있습니다.

1. 유저 질문 발생 
2. Embedding을 통해 벡터 DB를 조회
3. 매칭된 벡터를 기반으로 원본 문서를 검색
4. 매칭 점수가 높으면 분할 저장(청크)된 원문을 프롬프트에 전달
5. 매칭 점수가 애매하거나, 낮거나 혹은 제목에 해당하는 분할 벡터라면 원본(markdown 게시글)의 요약본을 프롬프트에 전달

## 참고한 문서
[Cloudflare Vectorize API](https://developers.cloudflare.com/api/node/resources/vectorize/)

[Cloudflare Workers Document](https://developers.cloudflare.com/workers/)

[Openai API Document](https://platform.openai.com/docs/api-reference/)

[Deepseek API Document](https://api-docs.deepseek.com/)
