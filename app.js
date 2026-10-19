/**
 * Clique & Poesia — Lógica da Galeria do Cliente
 * Sistema de Seleção, Visualização e Download de Fotos
 */

(function () {
  'use strict';

  const data = window.GALLERY_DATA || {
    clientName: "Fernanda",
    eventTitle: "Meus 15 Anos",
    photographerBrand: "Clique & Poesia",
    photographerWhatsapp: "5511999999999",
    totalPhotos: 0,
    photos: []
  };

  const STORAGE_KEY = `clique_selection_${data.clientName.toLowerCase()}_${(data.eventTitle || '').toLowerCase().replace(/\s+/g, '_')}`;

  const state = {
    selectedIds: new Set(),
    activeFilter: 'all',
    searchQuery: '',
    lightboxIndex: -1,
    filteredPhotos: []
  };

  function loadSavedSelection() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          state.selectedIds = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar seleções salvas:', e);
    }
  }

  function saveSelection() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selectedIds]));
    } catch (e) {
      console.warn('Erro ao salvar seleções:', e);
    }
  }

  const elements = {
    photosGrid: document.getElementById('photosGrid'),
    totalPhotosCount: document.getElementById('totalPhotosCount'),
    selectedCountTab: document.getElementById('selectedCountTab'),
    selectedFloatingCount: document.getElementById('selectedFloatingCount'),
    floatingBar: document.getElementById('floatingBar'),
    searchInput: document.getElementById('searchInput'),
    tabAll: document.getElementById('tabAll'),
    tabSelected: document.getElementById('tabSelected'),
    btnSelectAll: document.getElementById('btnSelectAll'),
    btnClearSelection: document.getElementById('btnClearSelection'),
    btnDownloadSelected: document.getElementById('btnDownloadSelected'),
    btnSendWhatsapp: document.getElementById('btnSendWhatsapp'),
    btnCopyCodes: document.getElementById('btnCopyCodes'),
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxPrev: document.getElementById('lightboxPrev'),
    lightboxNext: document.getElementById('lightboxNext'),
    lightboxClose: document.getElementById('lightboxClose'),
    lightboxDownload: document.getElementById('lightboxDownload'),
    lightboxFavorite: document.getElementById('lightboxFavorite'),
    progressModal: document.getElementById('progressModal'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressStatusText: document.getElementById('progressStatusText'),
    toastContainer: document.getElementById('toastContainer')
  };

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function computeFilteredPhotos() {
    return data.photos.filter(photo => {
      if (state.activeFilter === 'selected' && !state.selectedIds.has(photo.id)) {
        return false;
      }
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        return photo.fileName.toLowerCase().includes(query) || photo.title.toLowerCase().includes(query);
      }
      return true;
    });
  }

  function renderGallery() {
    state.filteredPhotos = computeFilteredPhotos();
    elements.photosGrid.innerHTML = '';

    if (state.filteredPhotos.length === 0) {
      elements.photosGrid.innerHTML = `
        <div class="empty-gallery">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <h3>Nenhuma foto encontrada</h3>
          <p>${state.activeFilter === 'selected' 
            ? 'Você ainda não selecionou nenhuma foto. Clique no coração das fotos para marcá-las!' 
            : 'Nenhum resultado corresponde à sua pesquisa.'}</p>
        </div>
      `;
      updateCounters();
      return;
    }

    const fragment = document.createDocumentFragment();

    state.filteredPhotos.forEach((photo, index) => {
      const isSelected = state.selectedIds.has(photo.id);
      const card = document.createElement('div');
      card.className = `photo-card ${isSelected ? 'is-selected' : ''}`;
      card.dataset.id = photo.id;

      card.innerHTML = `
        <div class="card-image-wrap" data-index="${index}">
          <span class="card-number-badge">#${photo.id}</span>
          <img src="${encodeURI(photo.url)}" alt="${photo.title}" loading="lazy" decoding="async">
          <button type="button" class="select-toggle-btn" title="${isSelected ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-label="Favoritar foto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSelected ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <div class="card-zoom-overlay">
            <div class="zoom-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="photo-info">
            <span class="photo-name" title="${photo.fileName}">${photo.fileName}</span>
            <span class="photo-size">${photo.sizeMb ? photo.sizeMb + ' MB' : 'Alta Resolução'}</span>
          </div>
          <div class="card-actions">
            <a href="${encodeURI(photo.url)}" download="${photo.fileName}" class="btn-card-download" title="Baixar esta foto em alta qualidade">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      `;

      const imageWrap = card.querySelector('.card-image-wrap');
      const selectBtn = card.querySelector('.select-toggle-btn');

      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePhotoSelection(photo.id);
      });

      imageWrap.addEventListener('click', (e) => {
        if (e.target.closest('.select-toggle-btn')) return;
        openLightbox(index);
      });

      fragment.appendChild(card);
    });

    elements.photosGrid.appendChild(fragment);
    updateCounters();
  }

  function togglePhotoSelection(photoId) {
    if (state.selectedIds.has(photoId)) {
      state.selectedIds.delete(photoId);
      showToast('Foto desmarcada');
    } else {
      state.selectedIds.add(photoId);
      showToast(`Foto #${photoId} selecionada!`);
    }
    saveSelection();
    updateCardSelectionVisual(photoId);
    updateCounters();
    updateLightboxButtons();

    if (state.activeFilter === 'selected') {
      renderGallery();
    }
  }

  function updateCardSelectionVisual(photoId) {
    const card = elements.photosGrid.querySelector(`[data-id="${photoId}"]`);
    if (!card) return;

    const isSelected = state.selectedIds.has(photoId);
    card.classList.toggle('is-selected', isSelected);

    const btn = card.querySelector('.select-toggle-btn');
    if (isSelected) {
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      btn.title = 'Remover dos favoritos';
    } else {
      btn.querySelector('svg').setAttribute('fill', 'none');
      btn.title = 'Adicionar aos favoritos';
    }
  }

  function updateCounters() {
    const selectedCount = state.selectedIds.size;
    const totalCount = data.photos.length;

    if (elements.totalPhotosCount) elements.totalPhotosCount.textContent = totalCount;
    if (elements.selectedCountTab) elements.selectedCountTab.textContent = selectedCount;
    if (elements.selectedFloatingCount) elements.selectedFloatingCount.textContent = selectedCount;

    if (selectedCount > 0) {
      elements.floatingBar.classList.add('is-visible');
    } else {
      elements.floatingBar.classList.remove('is-visible');
    }
  }

  // Lightbox
  function openLightbox(index) {
    if (index < 0 || index >= state.filteredPhotos.length) return;
    state.lightboxIndex = index;
    const photo = state.filteredPhotos[index];

    elements.lightboxImg.src = encodeURI(photo.url);
    elements.lightboxTitle.textContent = photo.fileName;
    elements.lightboxCounter.textContent = `${index + 1} de ${state.filteredPhotos.length}`;
    elements.lightboxDownload.href = encodeURI(photo.url);
    elements.lightboxDownload.setAttribute('download', photo.fileName);

    updateLightboxButtons();
    elements.lightboxModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    elements.lightboxModal.classList.remove('is-open');
    document.body.style.overflow = '';
    state.lightboxIndex = -1;
  }

  function nextLightbox() {
    if (state.lightboxIndex < state.filteredPhotos.length - 1) {
      openLightbox(state.lightboxIndex + 1);
    } else {
      openLightbox(0);
    }
  }

  function prevLightbox() {
    if (state.lightboxIndex > 0) {
      openLightbox(state.lightboxIndex - 1);
    } else {
      openLightbox(state.filteredPhotos.length - 1);
    }
  }

  function updateLightboxButtons() {
    if (state.lightboxIndex === -1) return;
    const photo = state.filteredPhotos[state.lightboxIndex];
    if (!photo) return;

    const isSelected = state.selectedIds.has(photo.id);
    elements.lightboxFavorite.classList.toggle('active-favorite', isSelected);
    const heartSvg = elements.lightboxFavorite.querySelector('svg');
    if (heartSvg) {
      heartSvg.setAttribute('fill', isSelected ? 'currentColor' : 'none');
    }
  }

  // Downloads
  async function downloadSelectedPhotos() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Por favor, selecione pelo menos uma foto.');
      return;
    }

    elements.progressModal.classList.add('is-active');
    elements.progressBarFill.style.width = '0%';
    elements.progressStatusText.textContent = `Preparando ${selectedPhotos.length} fotos...`;

    const canUseZip = typeof JSZip !== 'undefined' && window.location.protocol !== 'file:';

    if (canUseZip) {
      try {
        const zip = new JSZip();
        const folderName = `${data.clientName}_15_Anos_Fotos_Escolhidas`;
        const folder = zip.folder(folderName);

        for (let i = 0; i < selectedPhotos.length; i++) {
          const photo = selectedPhotos[i];
          const progressPercent = Math.round(((i + 1) / selectedPhotos.length) * 85);
          elements.progressBarFill.style.width = `${progressPercent}%`;
          elements.progressStatusText.textContent = `Baixando foto ${i + 1} de ${selectedPhotos.length} (${photo.fileName})...`;

          const response = await fetch(photo.url);
          if (!response.ok) throw new Error(`Falha ao ler ${photo.fileName}`);
          const blob = await response.blob();
          folder.file(photo.fileName, blob);
        }

        elements.progressStatusText.textContent = 'Compactando seu pacote em arquivo ZIP...';
        elements.progressBarFill.style.width = '95%';

        const content = await zip.generateAsync({
          type: 'blob',
          compression: 'STORE'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        elements.progressBarFill.style.width = '100%';
        elements.progressStatusText.textContent = 'Pronto! Seu download foi iniciado com sucesso.';
        setTimeout(() => {
          elements.progressModal.classList.remove('is-active');
          showToast('Download concluído!');
        }, 1200);
        return;
      } catch (err) {
        console.warn('Erro ao gerar ZIP, iniciando fallback sequencial:', err);
      }
    }

    elements.progressStatusText.textContent = 'Baixando fotos uma a uma...';
    for (let i = 0; i < selectedPhotos.length; i++) {
      const photo = selectedPhotos[i];
      const progressPercent = Math.round(((i + 1) / selectedPhotos.length) * 100);
      elements.progressBarFill.style.width = `${progressPercent}%`;
      elements.progressStatusText.textContent = `Baixando ${i + 1} de ${selectedPhotos.length}: ${photo.fileName}...`;

      const link = document.createElement('a');
      link.href = encodeURI(photo.url);
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await new Promise(r => setTimeout(r, 400));
    }

    elements.progressStatusText.textContent = 'Downloads concluídos!';
    setTimeout(() => {
      elements.progressModal.classList.remove('is-active');
      showToast('Todas as fotos foram baixadas!');
    }, 1200);
  }

  function sendSelectionViaWhatsapp() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Selecione pelo menos uma foto para enviar.');
      return;
    }

    const fileNames = selectedPhotos.map(p => `• ${p.fileName}`).join('\n');
    const message = `✨ *Seleção de Fotos — Clique & Poesia*\n\n` +
      `Olá! Aqui estão as *${selectedPhotos.length} fotos* que escolhi do ensaio de *${data.clientName} (${data.eventTitle})*:\n\n` +
      `${fileNames}\n\n` +
      `Total: ${selectedPhotos.length} fotos selecionadas. Aguardo o retorno para os próximos passos!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${data.photographerWhatsapp}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }

  function copySelectedCodes() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Nenhuma foto selecionada para copiar.');
      return;
    }

    const codes = selectedPhotos.map(p => p.fileName).join(', ');
    navigator.clipboard.writeText(codes).then(() => {
      showToast(`Códigos de ${selectedPhotos.length} fotos copiados!`);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = codes;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(`Códigos de ${selectedPhotos.length} fotos copiados!`);
    });
  }

  function setupEventListeners() {
    elements.tabAll.addEventListener('click', () => {
      elements.tabAll.classList.add('active');
      elements.tabSelected.classList.remove('active');
      state.activeFilter = 'all';
      renderGallery();
    });

    elements.tabSelected.addEventListener('click', () => {
      elements.tabSelected.classList.add('active');
      elements.tabAll.classList.remove('active');
      state.activeFilter = 'selected';
      renderGallery();
    });

    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderGallery();
    });

    elements.btnSelectAll.addEventListener('click', () => {
      const photosToSelect = state.searchQuery ? state.filteredPhotos : data.photos;
      photosToSelect.forEach(p => state.selectedIds.add(p.id));
      saveSelection();
      renderGallery();
      showToast(`Todas as ${photosToSelect.length} fotos foram selecionadas!`);
    });

    elements.btnClearSelection.addEventListener('click', () => {
      if (state.selectedIds.size === 0) return;
      if (confirm('Deseja realmente limpar toda a sua seleção de fotos?')) {
        state.selectedIds.clear();
        saveSelection();
        renderGallery();
        showToast('Seleção limpa.');
      }
    });

    elements.btnDownloadSelected.addEventListener('click', downloadSelectedPhotos);
    elements.btnSendWhatsapp.addEventListener('click', sendSelectionViaWhatsapp);
    elements.btnCopyCodes.addEventListener('click', copySelectedCodes);

    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightboxPrev.addEventListener('click', prevLightbox);
    elements.lightboxNext.addEventListener('click', nextLightbox);

    elements.lightboxFavorite.addEventListener('click', () => {
      if (state.lightboxIndex === -1) return;
      const photo = state.filteredPhotos[state.lightboxIndex];
      if (photo) {
        togglePhotoSelection(photo.id);
      }
    });

    elements.lightboxModal.addEventListener('click', (e) => {
      if (e.target === elements.lightboxModal || e.target.classList.contains('lightbox-stage')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!elements.lightboxModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    });
  }

  function init() {
    loadSavedSelection();
    setupEventListeners();
    renderGallery();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
