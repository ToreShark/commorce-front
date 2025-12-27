"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getStaticPageById,
  updateStaticPage,
  StaticPage,
  UpdateStaticPageRequest,
} from "../../../lib/data";
import WysiwygEditor from "../../../components/WysiwygEditor";

export default function EditStaticPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Необходима авторизация");
          setLoading(false);
          return;
        }

        const data = await getStaticPageById(id, token);
        if (data) {
          setPage(data);
          setTitle(data.title);
          setContent(data.content);
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setMetaKeywords(data.metaKeywords || "");
          setIsActive(data.isActive);
        } else {
          setError("Страница не найдена");
        }
      } catch (err) {
        setError("Ошибка загрузки страницы");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = await updateStaticPage(id, updateData, token);
      if (result) {
        setSuccess(true);
        setPage(result);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="p-6">
        <Link href="/dashboard/pages" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Назад к списку
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/pages" className="text-blue-600 hover:underline">
          &larr; Назад к списку
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        Редактирование: {page?.title}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Страница успешно сохранена!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={page?.slug || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Доступно по адресу: /{page?.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={250}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Содержимое *
            </label>
            <WysiwygEditor value={content} onChange={setContent} />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Страница активна
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-medium">SEO настройки</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={250}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              maxLength={500}
              placeholder="ключевые, слова, через, запятую"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>

          <Link
            href={`/${page?.slug}`}
            target="_blank"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Просмотр страницы
          </Link>
        </div>
      </form>
    </div>
  );
}
