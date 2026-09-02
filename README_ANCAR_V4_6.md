# Implantação ANCAR Frontend V4.6

1. Substitua o frontend V4.5 pela V4.6.
2. Mantenha o Workflow 10 V3 de comparativos ativo; não há mudança de backend.
3. Após o deploy, deixe a dashboard aberta por mais de 3 minutos e observe o próximo polling.
4. O esperado é que apenas números, estados, ranking e paths dos gráficos mudem; não deve haver skeleton, flash, remontagem ou animação de entrada.
5. O texto `Última atualização HH:mm` muda conforme o `collectedAt` real recebido.
