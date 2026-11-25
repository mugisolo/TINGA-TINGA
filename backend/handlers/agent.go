package handlers

import (
	"encoding/json"
	"net/http"

	"enganda-safaris/backend/models"
	"enganda-safaris/backend/services"
)

// AgentHandler exposes HTTP endpoints for Google GenAI autonomous safari planning
// and direct structured tool execution.
type AgentHandler struct {
	genaiSvc *services.GenAIService
}

// NewAgentHandler creates a new handler wired to GenAIService.
func NewAgentHandler(genaiSvc *services.GenAIService) *AgentHandler {
	return &AgentHandler{
		genaiSvc: genaiSvc,
	}
}

// HandleAgentChat processes autonomous multi-step safari planning conversations via Google GenAI SDK.
func (h *AgentHandler) HandleAgentChat(w http.ResponseWriter, r *http.Request) {
	var req models.AgentChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": "invalid agent chat payload",
		})
		return
	}

	resp, err := h.genaiSvc.HandleAutonomousPlanningChat(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusOK, models.AgentChatResponse{
			Text:     "",
			Fallback: true,
		})
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// HandleExecuteTool executes one of the 5 structured autonomous tools directly.
func (h *AgentHandler) HandleExecuteTool(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ToolName string         `json:"toolName"`
		Args     map[string]any `json:"args"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": "invalid tool execution payload",
		})
		return
	}

	if req.Args == nil {
		req.Args = map[string]any{}
	}

	callResult := h.genaiSvc.ExecuteTool(req.ToolName, req.Args)
	writeJSON(w, http.StatusOK, callResult)
}
