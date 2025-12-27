"use client";

import { useEffect, useState } from "react";
import {
  getAllStaticPages,
  getStaticPageById,
  updateStaticPage,
  StaticPage,
  StaticPageListItem,
  UpdateStaticPageRequest,
} from "../../lib/data";
import WysiwygEditor from "../../components/WysiwygEditor";

export default function StaticPagesAdmin() {
  const [pages, setPages] = useState<StaticPageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Необходима авторизация");
        setLoading(false);
        return;
      }

      const data = await getAllStaticPages(token);
      setPages(data);
    } catch (err) {
      setError("Ошибка загрузки страниц");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Необходима авторизация");
        return;
      }

      const page = await getStaticPageById(id, token);
      if (page) {
        setEditingPage(page);
        setTitle(page.title);
        setContent(page.content);
        setMetaTitle(page.metaTitle || "");
        setMetaDescription(page.metaDescription || "");
        setMetaKeywords(page.metaKeywords || "");
        setIsActive(page.isActive);
      }
    } catch (err) {
      setError("Ошибка загрузки страницы");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Необходима авторизация");
        setSaving(false);
        return;
      }

      const updateData: UpdateStaticPageRequest = {
        title,
        content,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
        isActive,
      };

      const result = await updateStaticPage(editingPage.id, updateData, token);
      if (result) {
        setSuccess(true);
        setEditingPage(result);
        fetchPages(); // Refresh list
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Ошибка сохранения");
      }
    } catch (err) {
      setError("Ошибка сохранения страницы");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setEditingPage(null);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="sherah-dsinner">
        <div className="row">
          <div className="col-12">
            <div className="sherah-breadcrumb mg-top-30">
              <h2 className="sherah-breadcrumb__title">Статические страницы</h2>
            </div>
          </div>
        </div>
        <div className="row mg-top-30">
          <div className="col-12">
            <div className="sherah-wc sherah-default-bg">
              <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
                <div className="spinner-border" role="status">
                  <span>Загрузка...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (editingPage) {
    return (
      <div className="sherah-dsinner">
        <div className="row">
          <div className="col-12">
            <div className="sherah-breadcrumb mg-top-30">
              <button
                onClick={handleBack}
                className="sherah-btn sherah-btn__secondary"
                style={{ marginRight: "15px" }}
              >
                &larr; Назад
              </button>
              <h2 className="sherah-breadcrumb__title" style={{ display: "inline" }}>
                Редактирование: {editingPage.title}
              </h2>
            </div>
          </div>
        </div>

        {error && (
          <div className="row mg-top-20">
            <div className="col-12">
              <div className="sherah-alert sherah-alert__danger">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="row mg-top-20">
            <div className="col-12">
              <div className="sherah-alert sherah-alert__success">
                Страница успешно сохранена!
              </div>
            </div>
          </div>
        )}

        <div className="row mg-top-30">
          <div className="col-12">
            <div className="sherah-wc sherah-default-bg">
              <div className="sherah-wc__heading">
                <h3 className="sherah-wc__title">Основные данные</h3>
              </div>
              <div className="sherah-wc__form-inner">
                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Slug (URL)</label>
                  <input
                    type="text"
                    value={editingPage.slug}
                    disabled
                    className="sherah-wc__form-input"
                    style={{ backgroundColor: "#e9ecef" }}
                  />
                  <p style={{ marginTop: "5px", fontSize: "12px", color: "#878f9a" }}>
                    Доступно по адресу: /{editingPage.slug}
                  </p>
                </div>

                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Заголовок *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={250}
                    className="sherah-wc__form-input"
                  />
                </div>

                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Содержимое *</label>
                  <WysiwygEditor value={content} onChange={setContent} />
                </div>

                <div className="sherah-wc__form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Страница активна
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mg-top-30">
          <div className="col-12">
            <div className="sherah-wc sherah-default-bg">
              <div className="sherah-wc__heading">
                <h3 className="sherah-wc__title">SEO настройки</h3>
              </div>
              <div className="sherah-wc__form-inner">
                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    maxLength={250}
                    className="sherah-wc__form-input"
                  />
                </div>

                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="sherah-wc__form-input sherah-wc__form-input--textarea"
                  />
                </div>

                <div className="sherah-wc__form-group">
                  <label className="sherah-wc__form-label">Meta Keywords</label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    maxLength={500}
                    placeholder="ключевые, слова, через, запятую"
                    className="sherah-wc__form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mg-top-30 mg-btm-30">
          <div className="col-12">
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="sherah-btn sherah-btn__primary"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <a
                href={`/${editingPage.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sherah-btn sherah-btn__secondary"
              >
                Просмотр страницы
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="sherah-dsinner">
      <div className="row">
        <div className="col-12">
          <div className="sherah-breadcrumb mg-top-30">
            <h2 className="sherah-breadcrumb__title">Статические страницы</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="row mg-top-20">
          <div className="col-12">
            <div className="sherah-alert sherah-alert__danger">{error}</div>
          </div>
        </div>
      )}

      <div className="row mg-top-30">
        <div className="col-12">
          <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg">
            <h3 className="sherah-table__title">Список страниц</h3>
            <table className="sherah-table__main">
              <thead className="sherah-table__head">
                <tr>
                  <th>Название</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Обновлено</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody className="sherah-table__body">
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <p className="sherah-table__product-name">{page.title}</p>
                    </td>
                    <td>
                      <span className="sherah-table__id">/{page.slug}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                          backgroundColor: page.isActive ? "#f6ffed" : "#fff2f0",
                          color: page.isActive ? "#52c41a" : "#ff4d4f",
                        }}
                      >
                        {page.isActive ? "Активна" : "Неактивна"}
                      </span>
                    </td>
                    <td>
                      {new Date(page.updatedAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <div className="sherah-table__product-action">
                        <button
                          onClick={() => handleEdit(page.id)}
                          className="sherah-btn sherah-btn__primary"
                        >
                          Редактировать
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mg-top-20 mg-btm-30">
        <div className="col-12">
          <div className="sherah-wc sherah-default-bg" style={{ padding: "20px 30px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#878f9a" }}>
              <strong>Публичные URL страниц:</strong>
            </p>
            <ul style={{ marginTop: "10px", marginBottom: 0, paddingLeft: "20px" }}>
              <li><code>/payment</code> - Оплата онлайн</li>
              <li><code>/payment-security</code> - Безопасность платежей</li>
              <li><code>/privacy-policy</code> - Политика конфиденциальности</li>
              <li><code>/warranty</code> - Гарантия и возврат</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
