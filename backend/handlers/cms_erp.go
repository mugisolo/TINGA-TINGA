package handlers

import (
	"encoding/json"
	"net/http"

	"enganda-safaris/backend/models"
	"enganda-safaris/backend/services"
)

type CMSERPHandler struct {
	cmsErpSvc *services.CMSERPService
}

func NewCMSERPHandler(cmsErpSvc *services.CMSERPService) *CMSERPHandler {
	return &CMSERPHandler{
		cmsErpSvc: cmsErpSvc,
	}
}

func (h *CMSERPHandler) HandleCMSOverview(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.cmsErpSvc.GetCMSOverview())
}

func (h *CMSERPHandler) HandleUpsertSiteBlock(w http.ResponseWriter, r *http.Request) {
	var block models.CMSSiteContentBlock
	if err := json.NewDecoder(r.Body).Decode(&block); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid CMS site block payload"})
		return
	}
	if block.Title == "" || block.Body == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title and body are required"})
		return
	}
	saved := h.cmsErpSvc.UpsertSiteBlock(block)
	writeJSON(w, http.StatusOK, saved)
}

func (h *CMSERPHandler) HandleUpsertFooterLogo(w http.ResponseWriter, r *http.Request) {
	var logo models.CMSFooterPartnerLogo
	if err := json.NewDecoder(r.Body).Decode(&logo); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid footer partner logo payload"})
		return
	}
	if logo.Name == "" || logo.LogoURL == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and logoUrl are required"})
		return
	}
	saved := h.cmsErpSvc.UpsertFooterLogo(logo)
	writeJSON(w, http.StatusOK, saved)
}

func (h *CMSERPHandler) HandleERPOverview(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.cmsErpSvc.GetERPOverview())
}

func (h *CMSERPHandler) HandleAddHotelRoom(w http.ResponseWriter, r *http.Request) {
	var room models.ERPPartnerHotelRoom
	if err := json.NewDecoder(r.Body).Decode(&room); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ERP hotel room payload"})
		return
	}
	if room.RoomName == "" || room.PartnerName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "partnerName and roomName are required"})
		return
	}
	saved := h.cmsErpSvc.AddHotelRoom(room)
	writeJSON(w, http.StatusCreated, saved)
}

func (h *CMSERPHandler) HandleAddDriverFleet(w http.ResponseWriter, r *http.Request) {
	var vehicle models.ERPDriverFleetVehicle
	if err := json.NewDecoder(r.Body).Decode(&vehicle); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ERP driver fleet payload"})
		return
	}
	if vehicle.DriverName == "" || vehicle.VehicleName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "driverName and vehicleName are required"})
		return
	}
	saved := h.cmsErpSvc.AddDriverFleetVehicle(vehicle)
	writeJSON(w, http.StatusCreated, saved)
}

func (h *CMSERPHandler) HandleRecordFinanceTransaction(w http.ResponseWriter, r *http.Request) {
	var tx models.ERPFinanceLedgerEntry
	if err := json.NewDecoder(r.Body).Decode(&tx); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ERP finance transaction payload"})
		return
	}
	if tx.Title == "" || tx.AmountUSD <= 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title and positive amountUSD are required"})
		return
	}
	saved := h.cmsErpSvc.RecordFinanceTransaction(tx)
	writeJSON(w, http.StatusCreated, saved)
}

func (h *CMSERPHandler) HandleCreatePortalDispatch(w http.ResponseWriter, r *http.Request) {
	var dispatch models.ERPPortalDispatch
	if err := json.NewDecoder(r.Body).Decode(&dispatch); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ERP portal dispatch payload"})
		return
	}
	if dispatch.Title == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"})
		return
	}
	saved := h.cmsErpSvc.CreatePortalDispatch(dispatch)
	writeJSON(w, http.StatusCreated, saved)
}
